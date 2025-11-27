using EduManagement.Core.Application.DTOs.Common;
using EduManagement.Core.Application.DTOs.CourseClass;
using EduManagement.Core.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using EduManagement.Shared.Exceptions;

namespace EduManagement.Presentation.Controllers.v1;

/// <summary>
/// Controller for managing course classes (lớp học phần)
/// </summary>
[ApiController]
[Produces("application/json")]
public class CourseClassController : ControllerBase
{
    private readonly ICourseService _courseService;
    private readonly ICourseClassService _courseClassService;
    private readonly ILogger<CourseClassController> _logger;

    public CourseClassController(
        ICourseService courseService,
        ICourseClassService courseClassService,
        ILogger<CourseClassController> logger)
    {
        _courseService = courseService;
        _courseClassService = courseClassService;
        _logger = logger;
    }

    /// <summary>
    /// [Admin] Tạo lớp học phần mới với tự động phát hiện xung đột lịch
    /// </summary>
    /// <remarks>
    /// Endpoint này yêu cầu chỉ định period range (morning/afternoon/evening) để:
    /// - Xác định khung giờ học chính xác
    /// - Tính toán ngày kết thúc dựa trên số tiết/tuần:
    ///   * Morning (7:15-11:50): 5 tiết/tuần → hoàn thành nhanh hơn
    ///   * Afternoon (13:30-18:00): 5 tiết/tuần → tiến độ chuẩn  
    ///   * Evening (18:05-20:45): 3 tiết/tuần → hoàn thành chậm hơn
    /// </remarks>
    /// <param name="request">Thông tin lớp học phần cần tạo (bao gồm periodRange)</param>
    /// <returns>Thông tin lớp học phần vừa được tạo</returns>
    [HttpPost("v1/course-classes")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<CourseClassResponseDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateCourseClass([FromBody] CreateCourseClassRequestDto request)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(ApiResponse<object>.ErrorResponse(
                    "Không tìm thấy thông tin người dùng"
                ));
            }

            _logger.LogInformation($"Admin {userId} tạo lớp học phần mới (chưa có giảng viên) cho khóa học {request.CourseId}");

            var result = await _courseService.CreateCourseClassAsync(request, userId);

            return StatusCode(201, ApiResponse<CourseClassResponseDto>.SuccessResponse(
                result,
                "Tạo lớp học phần thành công. Vui lòng gán giảng viên."
            ));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Yêu cầu tạo lớp học phần không hợp lệ");
            return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tạo lớp học phần");
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "Đã xảy ra lỗi khi tạo lớp học phần"
            ));
        }
    }

    /// <summary>
    /// [Admin] Cập nhật thông tin lớp học phần với kiểm tra xung đột lịch
    /// </summary>
    /// <remarks>
    /// API này cập nhật thông tin lớp học phần KHÔNG BAO GỒM giảng viên.
    /// 
    /// Để gán/thay đổi giảng viên, sử dụng API riêng: POST /v1/course-classes/{courseClassId}/assign-instructor
    /// 
    /// Khi cập nhật period range, hệ thống sẽ tự động:
    /// - Tính lại ngày kết thúc dựa trên khung giờ mới
    /// - Kiểm tra xung đột lịch phòng học với khung giờ mới
    /// - Kiểm tra xung đột lịch giảng viên (nếu đã được gán)
    /// - Cập nhật các tiết học phù hợp với period range
    /// </remarks>
    /// <param name="courseClassId">ID của lớp học phần cần cập nhật</param>
    /// <param name="request">Thông tin cần cập nhật (phòng học, ngày bắt đầu, khung giờ, số lượng sinh viên tối đa, trạng thái)</param>
    /// <returns>Thông tin lớp học phần sau khi cập nhật</returns>
    [HttpPut("v1/course-classes/{courseClassId}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<CourseClassResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateCourseClass(
        [FromRoute] Guid courseClassId,
        [FromBody] UpdateCourseClassRequestDto request)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(ApiResponse<object>.ErrorResponse(
                    "Không tìm thấy thông tin người dùng"
                ));
            }

            _logger.LogInformation($"Admin {userId} cập nhật lớp học phần {courseClassId}");

            var result = await _courseService.UpdateCourseClassAsync(courseClassId, request, userId);

            return Ok(ApiResponse<CourseClassResponseDto>.SuccessResponse(
                result,
                "Cập nhật lớp học phần thành công"
            ));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, $"Yêu cầu cập nhật lớp học phần {courseClassId} không hợp lệ");
            return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Lỗi khi cập nhật lớp học phần {courseClassId}");
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "Đã xảy ra lỗi khi cập nhật lớp học phần"
            ));
        }
    }

    /// <summary>
    /// [Admin] Xóa mềm lớp học phần (không xóa nếu có sinh viên đăng ký)
    /// </summary>
    /// <param name="courseClassId">ID của lớp học phần cần xóa</param>
    /// <returns>Kết quả xóa thành công hoặc thất bại</returns>
    [HttpDelete("v1/course-classes/{courseClassId}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteCourseClass([FromRoute] Guid courseClassId)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(ApiResponse<object>.ErrorResponse(
                    "Không tìm thấy thông tin người dùng"
                ));
            }

            _logger.LogInformation($"Admin {userId} xóa lớp học phần {courseClassId}");

            var result = await _courseService.DeleteCourseClassAsync(courseClassId, userId);

            if (result)
            {
                return Ok(ApiResponse<object>.SuccessResponse(
                    new { courseClassId, isDeleted = true, deletedAt = DateTime.UtcNow },
                    "Xóa lớp học phần thành công"
                ));
            }

            return NotFound(ApiResponse<object>.ErrorResponse(
                "Không tìm thấy lớp học phần"
            ));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, $"Không thể xóa lớp học phần {courseClassId}");
            return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Lỗi khi xóa lớp học phần {courseClassId}");
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "Đã xảy ra lỗi khi xóa lớp học phần"
            ));
        }
    }

    /// <summary>
    /// [Admin/Instructor/Student] Lấy thông tin chi tiết của lớp học phần
    /// </summary>
    /// <param name="courseClassId">ID của lớp học phần</param>
    /// <returns>Thông tin chi tiết lớp học phần</returns>
    [HttpGet("v1/course-classes/{courseClassId}")]
    [Authorize(Roles = "Admin,Instructor,Student")]
    [ProducesResponseType(typeof(ApiResponse<CourseClassDetailResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetCourseClassDetail([FromRoute] Guid courseClassId, [FromQuery] bool showStudents = false)
    {
        try
        {
            _logger.LogInformation($"Yêu cầu chi tiết lớp học phần: {courseClassId}");

            var result = await _courseService.GetCourseClassDetailAsync(courseClassId, showStudents);
            
            if (result == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse(
                    "Không tìm thấy lớp học phần"
                ));
            }

            return Ok(ApiResponse<CourseClassDetailResponseDto>.SuccessResponse(
                result,
                "Lấy thông tin lớp học phần thành công"
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Lỗi khi lấy chi tiết lớp học phần {courseClassId}");
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "Đã xảy ra lỗi khi lấy thông tin lớp học phần"
            ));
        }
    }

    /// <summary>
    /// [Admin] Lấy gợi ý lịch học khả dụng cho ngày và tòa nhà cụ thể
    /// </summary>
    /// <param name="date">Ngày cần kiểm tra lịch (định dạng yyyy-MM-dd)</param>
    /// <param name="buildingId">ID tòa nhà (tùy chọn)</param>
    /// <param name="roomType">Loại phòng học (tùy chọn)</param>
    /// <returns>Danh sách gợi ý lịch học khả dụng</returns>
    [HttpGet("v1/course-classes/schedule-suggestions")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<ScheduleSuggestionResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetScheduleSuggestions(
        [FromQuery] DateOnly date,
        [FromQuery] Guid? buildingId,
        [FromQuery] string? roomType)
    {
        try
        {
            _logger.LogInformation($"Admin yêu cầu gợi ý lịch học cho ngày {date}");

            var result = await _courseService.GetScheduleSuggestionsAsync(date, buildingId, roomType);

            return Ok(ApiResponse<ScheduleSuggestionResponseDto>.SuccessResponse(
                result,
                $"Lấy gợi ý lịch học thành công cho {result.DayOfWeek} ngày {date:dd/MM/yyyy}"
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Lỗi khi lấy gợi ý lịch học cho ngày {date}");
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "Đã xảy ra lỗi khi lấy gợi ý lịch học"
            ));
        }
    }

    /// <summary>
    /// [Admin] Lấy danh sách giảng viên khả dụng cho lớp học phần cụ thể
    /// </summary>
    /// <remarks>
    /// Endpoint này tự động lấy thông tin từ course class:
    /// - Học kỳ, môn học, khoa
    /// - Thứ trong tuần và khung giờ học
    /// Sau đó tìm tất cả giảng viên phù hợp và rảnh lịch
    /// </remarks>
    /// <param name="courseClassId">ID của lớp học phần cần gán giảng viên</param>
    /// <returns>Danh sách giảng viên khả dụng</returns>
    [HttpGet("v1/course-classes/{courseClassId}/available-instructors")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<AvailableInstructorsResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAvailableInstructorsForCourseClass(
        [FromRoute] Guid courseClassId)
    {
        try
        {
            _logger.LogInformation($"Admin yêu cầu danh sách giảng viên khả dụng cho lớp học phần {courseClassId}");

            var result = await _courseClassService.GetAvailableInstructorsForCourseClassAsync(courseClassId);

            var message = result.TotalCount > 0
                ? $"Tìm thấy {result.TotalCount} giảng viên khả dụng"
                : "Không tìm thấy giảng viên khả dụng";

            return Ok(ApiResponse<AvailableInstructorsResponseDto>.SuccessResponse(
                result,
                message
            ));
        }
        catch (AppException ex)
        {
            _logger.LogWarning(ex, $"Không tìm thấy lớp học phần {courseClassId}");
            return NotFound(ApiResponse<object>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Lỗi khi lấy danh sách giảng viên khả dụng cho lớp {courseClassId}");
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "Đã xảy ra lỗi khi lấy danh sách giảng viên khả dụng"
            ));
        }
    }

    /// <summary>
    /// [Admin] Gán giảng viên cho lớp học phần
    /// </summary>
    /// <remarks>
    /// Endpoint này cho phép:
    /// - Gán giảng viên cho lớp học phần chưa có giảng viên
    /// - Ghi nhận thời điểm gán (mặc định là hiện tại)
    /// - Thêm ghi chú về việc gán giảng viên
    /// 
    /// Hệ thống sẽ tự động kiểm tra:
    /// - Giảng viên có khả dụng không (không xung đột lịch)
    /// - Giảng viên có thuộc đúng khoa không
    /// </remarks>
    /// <param name="courseClassId">ID của lớp học phần</param>
    /// <param name="request">Thông tin giảng viên và ghi chú</param>
    /// <returns>Thông tin lớp học phần sau khi gán giảng viên</returns>
    [HttpPost("v1/course-classes/{courseClassId}/assign-instructor")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<CourseClassDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AssignInstructor(
        [FromRoute] Guid courseClassId,
        [FromBody] AssignInstructorRequestDto request)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(ApiResponse<object>.ErrorResponse(
                    "Không tìm thấy thông tin người dùng"
                ));
            }

            _logger.LogInformation(
                $"Admin {userId} gán giảng viên {request.InstructorId} " +
                $"cho lớp học phần {courseClassId}");

            var result = await _courseClassService.AssignInstructorAsync(courseClassId, request);

            return Ok(ApiResponse<CourseClassDto>.SuccessResponse(
                result,
                "Gán giảng viên thành công"
            ));
        }
        catch (AppException ex)
        {
            _logger.LogWarning(ex, $"Không tìm thấy lớp học phần {courseClassId}");
            return NotFound(ApiResponse<object>.ErrorResponse(ex.Message));
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, $"Không thể gán giảng viên cho lớp {courseClassId}");
            return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Lỗi khi gán giảng viên cho lớp {courseClassId}");
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "Đã xảy ra lỗi khi gán giảng viên"
            ));
        }
    }

    /// <summary>
    /// [Admin] Lấy tất cả lớp học phần với tìm kiếm và lọc nâng cao
    /// </summary>
    [HttpGet("v1/course-classes/all")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<CourseClassAdvancedListResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAllCourseClasses([FromQuery] CourseClassAdvancedFilterDto filter)
    {
        try
        {
            _logger.LogInformation("Yêu cầu lấy tất cả lớp học phần với bộ lọc");
            
            var result = await _courseClassService.GetAllAdvancedAsync(filter);
            
            return Ok(ApiResponse<CourseClassAdvancedListResponseDto>.SuccessResponse(
                result,
                $"Tìm thấy {result.TotalCount} lớp học phần"
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách lớp học phần");
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "Đã xảy ra lỗi khi lấy danh sách lớp học phần"
            ));
        }
    }

}