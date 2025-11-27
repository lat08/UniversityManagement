using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using Microsoft.AspNetCore.Http; // For IFormFile swagger mapping
using EduManagement.Core.Application.DTOs;
using EduManagement.Infrastructure.Repositories;
using EduManagement.Shared;
using EduManagement.Shared.Constants;
using EduManagement.Shared.Helpers.DapperHandlers;
using EduManagement.Shared.Helpers;
using EduManagement.Infrastructure.Data;
using EduManagement.Presentation.Middlewares;
using System.Reflection;
using System.Text;
using System.Text.Json.Serialization;
using AutoMapper;
using Dapper;
using EduManagement.Core.Application.DTOs.Payment;
using Microsoft.AspNetCore.Authorization;
using EduManagement.Core.Application.Services.Material;
using EduManagement.Infrastructure.Repositories.Material;
using EduManagement.Core.Application.Interfaces.Repositories.Material;
using EduManagement.Core.Application.Interfaces.Services.Material;

// ============================================================
// 0. GLOBAL CONFIG
// ============================================================

// Cấu hình encoding UTF-8 cho toàn bộ ứng dụng
Console.OutputEncoding = Encoding.UTF8;
Console.InputEncoding = Encoding.UTF8;
Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

// Load environment variables from .env file (chỉ ảnh hưởng local, Jenkins sẽ ghi đè)
EnvLoader.Load();

// Register DateOnly handler globally for Dapper
SqlMapper.AddTypeHandler(new DateOnlyTypeHandler());

// Create builder
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpClient();

// QUAN TRỌNG: Cấu hình chuẩn .NET - Nạp appsettings trước, rồi ghi đè bằng Environment Variables
// KHÔNG DÙNG AddEnvironmentVariableExpansion()
var configBuilder = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables(); // Dòng này sẽ đọc các biến ConnectionStrings__..., JwtSettings__... từ Jenkins

// ❌ DÒNG GÂY LỖI "configBuilder.AddEnvironmentVariableExpansion();" ĐÃ BỊ XÓA

// Replace the configuration sources built by default with our configured sources
builder.Configuration.Sources.Clear();
foreach (var source in configBuilder.Sources)
{
    builder.Configuration.Sources.Add(source);
}
// Configuration is now built and ready
var configuration = builder.Configuration;
var services = builder.Services;


// ============================================================
// 1.5. EXPAND ENVIRONMENT VARIABLES IN CONFIGURATION
// ============================================================

// Expand ConnectionStrings
var connectionStringTemplate = configuration.GetConnectionString("DefaultConnection");
if (!string.IsNullOrEmpty(connectionStringTemplate) && connectionStringTemplate.Contains("${"))
{
    var expandedConnectionString = EnvLoader.ExpandVariables(connectionStringTemplate);
    configuration["ConnectionStrings:DefaultConnection"] = expandedConnectionString;
    Console.WriteLine("[INFO] ✅ DefaultConnection expanded successfully");
}

var hangfireConnectionTemplate = configuration.GetConnectionString("HangfireConnectionString");
if (!string.IsNullOrEmpty(hangfireConnectionTemplate) && hangfireConnectionTemplate.Contains("${"))
{
    var expandedHangfireConnection = EnvLoader.ExpandVariables(hangfireConnectionTemplate);
    configuration["ConnectionStrings:HangfireConnectionString"] = expandedHangfireConnection;
    Console.WriteLine("[INFO] ✅ HangfireConnectionString expanded successfully");
}

// Expand JwtSettings
var jwtSettingsKeys = new[] { "Issuer", "Audience", "SecretKey", "KeyId", "AccessTokenExpirationSeconds", "RefreshTokenExpirationSeconds" };
foreach (var key in jwtSettingsKeys)
{
    var value = configuration[$"JwtSettings:{key}"];
    if (!string.IsNullOrEmpty(value) && value.Contains("${"))
    {
        configuration[$"JwtSettings:{key}"] = EnvLoader.ExpandVariables(value);
        Console.WriteLine($"[INFO] ✅ JwtSettings:{key} expanded successfully");
    }
}

// Expand EmailSettings
var emailSettingsKeys = new[] { "SmtpServer", "SmtpPort", "SenderEmail", "SenderName", "Password" };
foreach (var key in emailSettingsKeys)
{
    var value = configuration[$"EmailSettings:{key}"];
    if (!string.IsNullOrEmpty(value) && value.Contains("${"))
    {
        configuration[$"EmailSettings:{key}"] = EnvLoader.ExpandVariables(value);
    }
}

// Expand OtpSettings
var otpSettingsKeys = new[] { "ExpiryMinutes", "Length" };
foreach (var key in otpSettingsKeys)
{
    var value = configuration[$"OtpSettings:{key}"];
    if (!string.IsNullOrEmpty(value) && value.Contains("${"))
    {
        configuration[$"OtpSettings:{key}"] = EnvLoader.ExpandVariables(value);
    }
}

// Expand FileStorage
var fileStoragePath = configuration["FileStorage:Path"];
if (!string.IsNullOrEmpty(fileStoragePath) && fileStoragePath.Contains("${"))
{
    configuration["FileStorage:Path"] = EnvLoader.ExpandVariables(fileStoragePath);
}

// Expand PaymentSettings
var paymentSettingsKeys = new[] { "SepayAccountNumber", "SepayBankCode", "SepayQrApiUrl" };
foreach (var key in paymentSettingsKeys)
{
    var value = configuration[$"PaymentSettings:{key}"];
    if (!string.IsNullOrEmpty(value) && value.Contains("${"))
    {
        configuration[$"PaymentSettings:{key}"] = EnvLoader.ExpandVariables(value);
        Console.WriteLine($"[INFO] ✅ PaymentSettings:{key} expanded successfully");
    }
}

// Expand GeminiSettings
var geminiSettingsKeys = new[] { "ApiKey", "Model", "EmbeddingModel" };
foreach (var key in geminiSettingsKeys)
{
    var value = configuration[$"GeminiSettings:{key}"];
    if (!string.IsNullOrEmpty(value) && value.Contains("${"))
    {
        configuration[$"GeminiSettings:{key}"] = EnvLoader.ExpandVariables(value);
        Console.WriteLine($"[INFO] ✅ GeminiSettings:{key} expanded successfully");
    }
}

// Expand PineconeSettings
var pineconeSettingsKeys = new[] { "ApiKey", "Environment", "Host", "IndexName" };
foreach (var key in pineconeSettingsKeys)
{
    var value = configuration[$"PineconeSettings:{key}"];
    if (!string.IsNullOrEmpty(value) && value.Contains("${"))
    {
        configuration[$"PineconeSettings:{key}"] = EnvLoader.ExpandVariables(value);
        Console.WriteLine($"[INFO] ✅ PineconeSettings:{key} expanded successfully");
    }
}



// Register repositories and services
builder.Services.AddScoped<EduManagement.Core.Application.Interfaces.Repositories.IScheduleRepository, EduManagement.Infrastructure.Repositories.ScheduleRepository>();
builder.Services.AddScoped<EduManagement.Core.Application.Interfaces.Services.IWeekScheduleService, EduManagement.Core.Application.Services.WeekScheduleService>();
builder.Services.AddScoped<EduManagement.Core.Application.Interfaces.Repositories.IExamRepository, EduManagement.Infrastructure.Repositories.ExamRepository>();
builder.Services.AddScoped<EduManagement.Core.Application.Interfaces.Services.IExamScheduleService, EduManagement.Core.Application.Services.ExamScheduleService>();
builder.Services.AddScoped<Core.Application.Interfaces.Repositories.IAdminExamScheduleRepository, Infrastructure.Repositories.AdminExamScheduleRepository>();
builder.Services.AddScoped<Core.Application.Interfaces.Services.IAdminExamScheduleService, Core.Application.Services.AdminExamScheduleService>();
builder.Services.AddScoped<IInstructorMaterialService, InstructorMaterialService>();
builder.Services.AddScoped<IInstructorMaterialRepository, InstructorMaterialRepository>();
builder.Services.AddScoped<EduManagement.Core.Application.Interfaces.Repositories.IPermissionRepository, PermissionRepository>();

// Instructor Exam Entry
builder.Services.AddScoped<EduManagement.Infrastructure.Repositories.InstructorExamEntryRepository>();
builder.Services.AddScoped<EduManagement.Core.Application.Interfaces.Services.IInstructorExamEntryService, EduManagement.Core.Application.Services.InstructorExamEntryService>();

// Chat & RAG Services
builder.Services.AddScoped<EduManagement.Core.Application.Interfaces.Services.Chat.IEmbeddingService, EduManagement.Infrastructure.Services.Chat.GeminiEmbeddingService>();
builder.Services.AddScoped<EduManagement.Core.Application.Interfaces.Services.Chat.IPineconeService, EduManagement.Infrastructure.Services.Chat.PineconeService>();
builder.Services.AddScoped<EduManagement.Core.Application.Interfaces.Services.Chat.IRagService, EduManagement.Infrastructure.Services.Chat.RagService>();
builder.Services.AddScoped<EduManagement.Core.Application.Interfaces.Services.Chat.IDynamicDataService, EduManagement.Infrastructure.Services.Chat.DynamicDataService>();
builder.Services.AddScoped<EduManagement.Infrastructure.Services.Chat.InstructorDynamicDataService>();
builder.Services.AddScoped<EduManagement.Core.Application.Interfaces.Services.Chat.IChatService, EduManagement.Infrastructure.Services.Chat.ChatService>();
builder.Services.AddScoped<EduManagement.Core.Application.Interfaces.Repositories.Chat.IChatHistoryRepository, EduManagement.Infrastructure.Repositories.Chat.ChatHistoryRepository>();
builder.Services.AddScoped<EduManagement.Core.Application.Interfaces.Repositories.Chat.IKnowledgeDocumentRepository, EduManagement.Infrastructure.Repositories.Chat.KnowledgeDocumentRepository>();
builder.Services.AddScoped<EduManagement.Infrastructure.Services.Chat.EmbeddingMigrationService>();



// ============================================================
// 1. ADD CONTROLLERS & JSON CONFIGURATION
// ============================================================

services
    .AddControllers(options => options.SuppressAsyncSuffixInActionNames = false)
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

services.AddEndpointsApiExplorer();

// ============================================================
// 2. DATABASE CONFIGURATION (ĐÃ SỬA)
// ============================================================

services.AddMemoryCache();
services.AddDbConnectConfiguration(configuration); // Assuming this adds Dapper context or similar

// Lấy Connection String TRỰC TIẾP từ configuration (đã được ghi đè bởi Jenkins)
var connectionString = configuration.GetConnectionString("DefaultConnection");

// Kiểm tra xem Connection String có hợp lệ không (không rỗng và không chứa placeholder ${...})
if (string.IsNullOrEmpty(connectionString) || connectionString.Contains("${"))
{
    // Nếu không hợp lệ, ném lỗi rõ ràng
    throw new InvalidOperationException($"DefaultConnection is not configured correctly or is empty/contains placeholders. Value received: '{connectionString}'. Ensure Jenkins is setting 'ConnectionStrings__DefaultConnection'.");
}

// Parse database name từ connection string để debug
string? ExtractDatabaseName(string connString)
{
    if (string.IsNullOrEmpty(connString))
        return null;

    var parts = connString.Split(';');
    foreach (var part in parts)
    {
        var trimmed = part.Trim();
        if (trimmed.StartsWith("Initial Catalog=", StringComparison.OrdinalIgnoreCase) ||
            trimmed.StartsWith("Database=", StringComparison.OrdinalIgnoreCase))
        {
            return trimmed.Split('=')[1].Trim();
        }
    }
    return null;
}

var dbName = ExtractDatabaseName(connectionString);
Console.WriteLine($"[DEBUG] Connection String (first 50 chars): {connectionString.Substring(0, Math.Min(50, connectionString.Length))}...");
Console.WriteLine($"[DEBUG] Database Name: {dbName ?? "NOT FOUND"}");


// Cấu hình DbContext
services.AddDbContext<EduManagementContext>(options =>
    options.UseSqlServer(connectionString));

// ============================================================
// 3. SWAGGER CONFIGURATION WITH JWT SUPPORT
// ============================================================

services.AddSwaggerGen(options =>
{
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
        options.IncludeXmlComments(xmlPath);

    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Version = "1.0",
        Title = "Edu Management API",
        Description = "API for Education Management System",
        Contact = new OpenApiContact
        {
            Name = "Edu Management Team",
            Email = "support@edu.vn"
        }
    });

    // Fix for OpenAPI version field issue
    options.EnableAnnotations();
    options.CustomSchemaIds(type => type.FullName);

    // Cấu hình JWT Bearer Authentication cho Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập JWT token vào ô bên dưới. Ví dụ: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    // Simplify IFormFile representation (single file input)
    options.MapType<IFormFile>(() => new OpenApiSchema { Type = "string", Format = "binary" });
});

// ============================================================
// 4. JWT AUTHENTICATION CONFIGURATION (ĐÃ SỬA)
// ============================================================

// Lấy JWT settings CHUẨN từ configuration (đã được ghi đè bởi Jenkins)
var secretKey = configuration["JwtSettings:SecretKey"];
var keyId = configuration["JwtSettings:KeyId"];
var issuer = configuration["JwtSettings:Issuer"] ?? "http://localhost:5000"; // Fallback nếu Jenkins không set
var audience = configuration["JwtSettings:Audience"] ?? "http://localhost:5000"; // Fallback nếu Jenkins không set

// Kiểm tra key CÓ TỒN TẠI VÀ KHÔNG BỊ RỖNG/PLACEHOLDER
if (string.IsNullOrEmpty(secretKey) || secretKey.Contains("${"))
{
    throw new InvalidOperationException($"JWT SecretKey (JwtSettings:SecretKey) is not configured correctly or is empty/contains placeholders. Value received: '{secretKey}'. Ensure Jenkins is setting 'JwtSettings__SecretKey'.");
}
if (string.IsNullOrEmpty(keyId) || keyId.Contains("${"))
{
    throw new InvalidOperationException($"JWT KeyId (JwtSettings:KeyId) is not configured correctly or is empty/contains placeholders. Value received: '{keyId}'. Ensure Jenkins is setting 'JwtSettings__KeyId'.");
}

// Log an toàn (đã sửa lỗi Substring)
Console.WriteLine($"[DEBUG] JWT_SECRET_KEY (first 20 chars): {secretKey.Substring(0, Math.Min(secretKey.Length, 20))}...");
Console.WriteLine($"[DEBUG] JWT_KEY_ID: {keyId}");


var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
{
    KeyId = keyId
};

services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false; // Nên là true trong production thực tế
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = issuer,
        ValidAudience = audience,
        IssuerSigningKey = signingKey,
        ClockSkew = TimeSpan.Zero // Không cho phép sai lệch thời gian
    };
    options.Events = new JwtBearerEvents { /* ... giữ nguyên events ... */ };
});

// ============================================================
// 5. AUTHORIZATION
// ============================================================

// 5.1. Đăng ký Handler để xử lý các yêu cầu quyền hạn (PermissionRequirement)
// Handler này sẽ được gọi mỗi khi một Policy dựa trên Permission được kiểm tra.
services.AddSingleton<IAuthorizationHandler, PermissionAuthorizationHandler>();

// 5.2. Định nghĩa tất cả các Policy Authorization TẠI MỘT NƠI DUY NHẤT
builder.Services.AddAuthorization(options =>
{
    // === Policy nhận thông báo chung cho các role
    // === Các Policy dành cho Chức năng Quản lý Điểm ===

    options.AddPolicy("CanUpdateGrades", policy =>
        policy.Requirements.Add(new PermissionRequirement(Permissions.Grades.Update))
    );

    options.AddPolicy("CanViewGrades", policy =>
        policy.Requirements.Add(new PermissionRequirement(Permissions.Grades.ViewStudentList))
    );

    options.AddPolicy("CanExportGrades", policy =>
        policy.Requirements.Add(new PermissionRequirement(Permissions.Grades.ViewStudentList))
    );
});


// ============================================================
// 6. REGISTER DEPENDENCIES (Repositories, Services, Mappers)
// ============================================================

services.Configure<PaymentOptionsDto>(configuration.GetSection(PaymentOptionsDto.PaymentSettings));

// Validate PaymentSettings
var sepayAccountNumber = configuration["PaymentSettings:SepayAccountNumber"];
var sepayBankCode = configuration["PaymentSettings:SepayBankCode"];
var sepayQrApiUrl = configuration["PaymentSettings:SepayQrApiUrl"];

if (string.IsNullOrEmpty(sepayAccountNumber) || sepayAccountNumber.Contains("${"))
{
    Console.WriteLine($"[WARNING] PaymentSettings:SepayAccountNumber is not configured. Value: '{sepayAccountNumber}'");
}
if (string.IsNullOrEmpty(sepayBankCode) || sepayBankCode.Contains("${"))
{
    Console.WriteLine($"[WARNING] PaymentSettings:SepayBankCode is not configured. Value: '{sepayBankCode}'");
}
if (string.IsNullOrEmpty(sepayQrApiUrl) || sepayQrApiUrl.Contains("${"))
{
    Console.WriteLine($"[WARNING] PaymentSettings:SepayQrApiUrl is not configured. Value: '{sepayQrApiUrl}'");
}

// Giữ nguyên phần đăng ký dependencies của bạn
services.RegisterServices(); // Assuming this registers all your other services/repos

// Background Service để tự động gửi thông báo theo scheduledDate
services.AddHostedService<EduManagement.Core.Application.Services.NotificationSchedulerService>();

// ============================================================
// 6.5. SIGNALR CONFIGURATION
// ============================================================

services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true; // Enable for debugging
    options.KeepAliveInterval = TimeSpan.FromSeconds(15);
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
});

// ============================================================
// 7. CORS CONFIGURATION
// ============================================================

services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("https://siu.acdm.site","http://34.126.154.149:5001", "http://34.126.154.149:5000",  "http://localhost:3000", "https://localhost:3000") // Frontend URL
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Required for SignalR
    });
});

// ============================================================
// 8. MISCELLANEOUS SERVICES
// ============================================================

services.AddMemoryCache();
services.AddConfiguredApiVersioning(); // Assuming this is an extension method you have

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();
// services.AddMemoryCache(); // Đã add ở trên

// ============================================================
// 9. BUILD APP
// ============================================================

var app = builder.Build();

// ============================================================
// 9.5. ENSURE DATABASE TABLES EXIST
// ============================================================
// Tự động tạo bảng notification_user_read nếu chưa tồn tại
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<EduManagementContext>();
    try
    {
        // Kiểm tra xem bảng notification_user_read có tồn tại không
        var checkTableSql = @"
            SELECT CASE 
                WHEN EXISTS (SELECT * FROM sys.tables WHERE name = 'notification_user_read' AND schema_id = SCHEMA_ID('dbo'))
                THEN 1 ELSE 0 END";
        
        var tableExists = false;
        try
        {
            using var command = context.Database.GetDbConnection().CreateCommand();
            command.CommandText = checkTableSql;
            context.Database.OpenConnection();
            var result = command.ExecuteScalar();
            tableExists = result != null && Convert.ToInt32(result) == 1;
        }
        catch
        {
            tableExists = false;
        }
        finally
        {
            context.Database.CloseConnection();
        }

        if (!tableExists)
        {
            Console.WriteLine("[INFO] 🔧 Bảng notification_user_read chưa tồn tại, đang tạo bảng...");
            
            // Tạo bảng notification_user_read
            context.Database.ExecuteSqlRaw(@"
                CREATE TABLE notification_user_read (
                    notification_user_read_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
                    schedule_id UNIQUEIDENTIFIER NOT NULL,
                    user_id UNIQUEIDENTIFIER NOT NULL,
                    read_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                    CONSTRAINT FK_notification_user_read_schedule FOREIGN KEY (schedule_id) 
                        REFERENCES notification_schedule(schedule_id) ON DELETE CASCADE,
                    CONSTRAINT FK_notification_user_read_user FOREIGN KEY (user_id) 
                        REFERENCES user_account(user_id) ON DELETE CASCADE,
                    CONSTRAINT UQ_notification_user_read UNIQUE (schedule_id, user_id)
                );
                
                CREATE INDEX idx_notification_user_read_user ON notification_user_read(user_id);
                CREATE INDEX idx_notification_user_read_schedule ON notification_user_read(schedule_id);
            ");
            
            Console.WriteLine("[INFO] ✅ Bảng notification_user_read đã được tạo thành công!");
        }
        else
        {
            Console.WriteLine("[INFO] ℹ️  Bảng notification_user_read đã tồn tại");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[ERROR] ❌ Lỗi khi kiểm tra/tạo bảng notification_user_read: {ex.Message}");
        // Không throw exception để app vẫn có thể chạy, nhưng sẽ log lỗi
    }

    // Tự động thêm cột report_file_url vào bảng schedule_change nếu chưa tồn tại
    try
    {
        var checkColumnSql = @"
            SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'schedule_change' 
            AND COLUMN_NAME = 'report_file_url'";
        
        var columnExists = false;
        try
        {
            using var command = context.Database.GetDbConnection().CreateCommand();
            command.CommandText = checkColumnSql;
            context.Database.OpenConnection();
            var result = command.ExecuteScalar();
            columnExists = result != null && Convert.ToInt32(result) > 0;
        }
        catch
        {
            columnExists = false;
        }
        finally
        {
            context.Database.CloseConnection();
        }

        if (!columnExists)
        {
            Console.WriteLine("[INFO] 🔧 Cột report_file_url chưa tồn tại trong bảng schedule_change, đang thêm cột...");
            
            // Thêm cột report_file_url
            context.Database.ExecuteSqlRaw(@"
                ALTER TABLE schedule_change
                ADD report_file_url NVARCHAR(1000) NULL;
            ");
            
            Console.WriteLine("[INFO] ✅ Cột report_file_url đã được thêm thành công vào bảng schedule_change!");
        }
        else
        {
            Console.WriteLine("[INFO] ℹ️  Cột report_file_url đã tồn tại trong bảng schedule_change");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[ERROR] ❌ Lỗi khi kiểm tra/thêm cột report_file_url: {ex.Message}");
        // Không throw exception để app vẫn có thể chạy, nhưng sẽ log lỗi
    }
}

// ============================================================
// 10. MIDDLEWARE PIPELINE
// ============================================================

// Giữ nguyên middleware pipeline của bạn
app.UsePathBase("/edu/api");
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Edu Management API v1.0");
    c.RoutePrefix = "swagger";
    c.DocumentTitle = "Edu Management API Documentation";
});
// Ensure wwwroot exists ...
app.UseRouting();
app.UseCors("AllowAll");

// app.UseHttpsRedirection(); // Nên bật trong production
app.UseAuthentication();
app.UseAuthorization();
// app.UseMiddleware<InterceptorHttpLoggingMiddleware>();
app.UseMiddleware<ErrorHandlerMiddleware>();
app.MapGet("/", () => Results.Redirect("/edu/api/swagger"));
app.MapGet("/health", () => "✅ Server is running!");
app.MapControllers();

// SignalR Hubs (PathBase "/edu/api" is already applied, so just use relative paths)
app.MapHub<EduManagement.Presentation.Hubs.NotificationHub>("/notification-hub");
app.MapHub<EduManagement.Presentation.Hubs.ThemeHub>("/theme-hub");
app.MapHub<EduManagement.Presentation.Hubs.ChatHub>("/chat-hub");

app.UseStaticFiles(new StaticFileOptions { /* ... */ });

// ============================================================
// 11. RUN APP
// ============================================================

app.Run();

// ============================================================
// EXPOSE Program CLASS FOR INTEGRATION TESTS
// ============================================================
public partial class Program { }