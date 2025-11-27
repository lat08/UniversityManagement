using Microsoft.AspNetCore.Authorization;
using EduManagement.Core.Application.Interfaces;
using EduManagement.Core.Application.Interfaces.Services;
using EduManagement.Core.Application.Interfaces.Repositories;
using EduManagement.Core.Application.Services;
using EduManagement.Infrastructure.Repositories;
using EduManagement.Infrastructure.Services;
using EduManagement.Shared;
using EduManagement.Shared.Logging;
using server.Application.Common.Interfaces;
using server.Repositories;
using EduManagement.Infrastructure.Repositories.Dashboard;
using EduManagement.Core.Application.Interfaces.Repositories.Dashboard;
using EduManagement.Core.Application.Interfaces.Services.Dashboard;
using EduManagement.Core.Application.Interfaces.Services.Instructor;
using EduManagement.Core.Application.Interfaces.Services.Student;
using EduManagement.Core.Application.Services.Student;
using EduManagement.Core.Application.Services.Instructor;
using EduManagement.Core.Application.Services.Dashboard;
using EduManagement.Core.Application.Services.Material;
using EduManagement.Infrastructure.Repositories.Material;
using EduManagement.Core.Application.Interfaces.Repositories.Material;
using EduManagement.Core.Application.Interfaces.Services.Material;

namespace EduManagement.Shared;

public static class ServiceCollectionExtension
{
        public static void RegisterServices(this IServiceCollection services)
        {
                services.AddHttpContextAccessor();


                // Repositories
                services.AddScoped<IPermissionRepository, PermissionRepository>();
                services.AddScoped<IRoleRepository, RoleRepository>();
                services.AddScoped<IUserRepository, UserRepository>();
                services.AddScoped<IAuthRepository, AuthRepository>();
                services.AddScoped<IStudentRepository, StudentRepository>();
                services.AddScoped<IInstructorRepository, InstructorRepository>();
                services.AddScoped<IClassScheduleRepository, ClassScheduleRepository>();
                services.AddScoped<ICourseEnrollmentRepository, CourseEnrollmentRepository>();
                services.AddScoped<IStudentMaterialRepository, StudentMaterialRepository>();
                services.AddScoped<IFunctionRoomRepository, FunctionRoomRepository>();
                services.AddScoped<IRoomRepository, RoomRepository>();
                services.AddScoped<IGradeRepository, GradeRepository>();
                services.AddScoped<IInstructorGradeRepository, InstructorGradeRepository>();
                services.AddScoped<IAdminGradeRepository, AdminGradeRepository>();
                services.AddScoped<IScheduleRepository, ScheduleRepository>();
                services.AddScoped<IInstructorScheduleRepository, InstructorScheduleRepository>();
                services.AddScoped<IStudentDashboardRepository, StudentDashboardRepository>();
                services.AddScoped<IInstructorDashboardRepository, InstructorDashboardRepository>();
                services.AddScoped<ICommonRepository, CommonRepository>();
                services.AddScoped<IRegulationRepository, RegulationRepository>(); // Dùng EF Core thay vì Dapper
                services.AddScoped<IStudentFinanceRepository, StudentFinanceRepository>();
                services.AddScoped<IPaymentRepository, PaymentRepository>();
                services.AddScoped<INotificationRepository, NotificationRepository>();
                services.AddScoped<IThemeRepository, ThemeRepository>();
                services.AddScoped<IInstructorMaterialRepository, InstructorMaterialRepository>();
                // services.AddScoped<IInstructorProfileRepository, InstructorProfileRepository>();
                services.AddScoped<ISubjectRepository, SubjectRepository>();
                services.AddScoped<ICourseRepository, CourseRepository>();
                services.AddScoped<IClassRepository, ClassRepository>();
                services.AddScoped<ICourseClassRepository, CourseClassRepository>();
                services.AddScoped<IFacultyRepository, FacultyRepository>();
                services.AddScoped<IDepartmentRepository, DepartmentRepository>();
                services.AddScoped<IAdminDashboardRepository, AdminDashboardRepository>();
                services.AddScoped<INoteRepository, NoteRepository>();
                services.AddScoped<ICurriculumRepository, CurriculumRepository>();
                services.AddScoped<IDivisionRepository, DivisionRepository>();
                services.AddScoped<IBuildingRepository, BuildingRepository>();

        // Services
                services.AddScoped<IPermissionService, JwtPermissionService>();
                services.AddScoped<IAuthService, AuthService>();
                // services.AddScoped<IScheduleChangeService, ScheduleChangeService>(); // Đã chuyển sang AdminScheduleChangeService
                services.AddScoped<IEmailService, EmailService>();
                services.AddScoped<IClassScheduleService, ClassScheduleService>();
                services.AddScoped<ICourseEnrollmentService, CourseEnrollmentService>();
                services.AddScoped<IStudentMaterialService, StudentMaterialService>();
                services.AddScoped<IFunctionRoomService, FunctionRoomService>();
                services.AddScoped<IRoomService, RoomService>();
                services.AddScoped<IGradeService, GradeService>();
                services.AddScoped<IInstructorGradeService, InstructorGradeService>();
                services.AddScoped<IAdminGradeService, AdminGradeService>();
                services.AddScoped<IWeekScheduleService, WeekScheduleService>();
                services.AddScoped<IInstructorScheduleService, InstructorScheduleService>();
                services.AddScoped<IStudentDashboardService, StudentDashboardService>();
                services.AddScoped<IInstructorDashboardService, InstructorDashboardService>();
                services.AddScoped<IStudentService, StudentService>();
                // services.AddScoped<IInstructorProfileService, InstructorProfileService>();
                services.AddScoped<IInstructorMaterialService, InstructorMaterialService>();
                services.AddScoped<RegulationService>();
                services.AddScoped<NotificationService>();
                services.AddScoped<AdminNotificationService>();
                services.AddScoped<IThemeService, ThemeService>();
                services.AddTransient<IAssistantService, AssistantService>();
                services.AddScoped<IStudentFinanceService, StudentFinanceService>();
                services.AddScoped<IPaymentService, PaymentService>();
                services.AddScoped<ISubjectService, SubjectService>();
                services.AddScoped<ICourseService, CourseService>();
                services.AddScoped<IClassService, ClassService>();
                services.AddScoped<ICourseClassService, CourseClassService>();
                services.AddScoped<IFacultyService, FacultyService>();
                services.AddScoped<IDepartmentService, DepartmentService>();
                services.AddScoped<IAdminDashboardService, AdminDashboardService>();
                services.AddScoped<IStudentExcelService, StudentExcelService>();
                services.AddScoped<IInstructorExcelService, InstructorExcelService>();
                services.AddScoped<IInstructorService, InstructorService>();
                services.AddScoped<INoteService, NoteService>();
                services.AddScoped<ICurriculumService, CurriculumService>();
                services.AddScoped<ScheduleChangeReportService>();
                services.AddScoped<IDivisionService, DivisionService>();
                services.AddScoped<IAdminScheduleChangeService, AdminScheduleChangeService>();
                services.AddScoped<IAdminExamService, AdminExamService>();
                services.AddScoped<IBuildingService, BuildingService>();

                // Infrastructure
                services.AddScoped<ILogManager, LoggerManager>();
                services.AddTransient<IUnitOfWork, UnitOfWork>();

                // Student Debt Dashboard
                services.AddScoped<IStudentDeptDashboardRepository, StudentDeptDashboardRepository>();
                services.AddScoped<IStudentDebtDashboardService, StudentDebtDashboardService>();

                // Authorization
                services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
                services.AddScoped<IAuthorizationHandler, JwtPermissionHandler>();

        }
}
