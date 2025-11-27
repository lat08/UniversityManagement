// Presentation/Controllers/v1/CourseController.cs
using EduManagement.Core.Application.DTOs.Common;
using EduManagement.Core.Application.DTOs.Course;
using EduManagement.Core.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EduManagement.Presentation.Controllers.v1
{
    [ApiController]
    [Produces("application/json")]
    [Authorize(Roles = "Admin")]
    public class CourseController : ControllerBase
    {
        private readonly ICourseService _courseService;
        private readonly ILogger<CourseController> _logger;

        public CourseController(
            ICourseService courseService,
            ILogger<CourseController> logger)
        {
            _courseService = courseService;
            _logger = logger;
        }

        /// <summary>
        /// [Admin] Lấy danh sách tất cả các khóa học với bộ lọc và phân trang
        /// </summary>
        /// <param name="semesterId">Lọc theo học kỳ (tùy chọn)</param>
        /// <param name="subjectId">Lọc theo môn học (tùy chọn)</param>
        /// <param name="departmentId">Lọc theo khoa (tùy chọn)</param>
        /// <param name="status">Lọc theo trạng thái: active, inactive, completed, cancelled (tùy chọn)</param>
        /// <param name="academicYear">Lọc theo năm học (tùy chọn)</param>
        /// <param name="semester">Lọc theo tên học kỳ hoặc loại học kỳ (tùy chọn)</param>
        /// <param name="pageNumber">Số trang (mặc định: 1)</param>
        /// <param name="pageSize">Kích thước trang (mặc định: 10)</param>
        /// <returns>Danh sách khóa học với thông tin phân trang</returns>
        [HttpGet("v1/courses")]
        [ProducesResponseType(typeof(ApiResponse<CourseListResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllCourses(
            [FromQuery] Guid? semesterId,
            [FromQuery] Guid? subjectId,
            [FromQuery] Guid? departmentId,
            [FromQuery] Guid? facultyId,
            [FromQuery] string? status,
            [FromQuery] Guid? academicYearId,
            [FromQuery] string? searchTerm,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                _logger.LogInformation("Admin yêu cầu lấy danh sách khóa học");

                var result = await _courseService.GetAllCoursesAsync(
                    semesterId, subjectId, departmentId, facultyId, status, academicYearId, searchTerm, pageNumber, pageSize);

                return Ok(ApiResponse<CourseListResponseDto>.SuccessResponse(
                    result,
                    "Lấy danh sách khóa học thành công"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách khóa học");
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "Đã xảy ra lỗi khi lấy danh sách khóa học"
                ));
            }
        }

        /// <summary>
        /// Lấy danh sách khóa học cho dropdown (có phân trang và lọc)
        /// </summary>
        /// <param name="semesterId">Lọc theo học kỳ (tùy chọn)</param>
        /// <param name="subjectId">Lọc theo môn học (tùy chọn)</param>
        /// <param name="departmentId">Lọc theo khoa (tùy chọn)</param>
        /// <param name="status">Lọc theo trạng thái: active, inactive, completed, cancelled (tùy chọn)</param>
        /// <param name="academicYear">Lọc theo năm học (tùy chọn)</param>
        /// <param name="semester">Lọc theo tên học kỳ hoặc loại học kỳ (tùy chọn)</param>
        /// <param name="pageNumber">Số trang (mặc định: 1)</param>
        /// <param name="pageSize">Kích thước trang (mặc định: 50, tối đa: 100)</param>
        /// <returns>Danh sách khóa học cho dropdown có phân trang</returns>
        [HttpGet("v1/courses/dropdown")]
        [Authorize(Roles = "Admin,Instructor,Student")]
        [ProducesResponseType(typeof(ApiResponse<CourseDropdownListResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetCoursesForDropdown(
            [FromQuery] Guid? semesterId,
            [FromQuery] Guid? subjectId,
            [FromQuery] Guid? departmentId,
            [FromQuery] Guid? facultyId,
            [FromQuery] string? status,
            [FromQuery] Guid? academicYearId,
            [FromQuery] string? searchTerm,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 50)
        {
            try
            {
                _logger.LogInformation("Yêu cầu lấy danh sách khóa học cho dropdown - Page: {PageNumber}, Size: {PageSize}", pageNumber, pageSize);

                var result = await _courseService.GetCoursesForDropdownAsync(
                    semesterId, subjectId, departmentId, facultyId, status, academicYearId, searchTerm, pageNumber, pageSize);

                return Ok(ApiResponse<CourseDropdownListResponseDto>.SuccessResponse(
                    result,
                    "Lấy danh sách khóa học cho dropdown thành công"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách khóa học cho dropdown");
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "Đã xảy ra lỗi khi lấy danh sách khóa học cho dropdown. Vui lòng thử lại."
                ));
            }
        }

        /// <summary>
        /// [Admin] Lấy thông tin chi tiết của một khóa học cụ thể
        /// </summary>
        /// <param name="courseId">ID của khóa học</param>
        /// <returns>Thông tin chi tiết khóa học bao gồm môn học, học kỳ và các lớp học</returns>
        [HttpGet("v1/courses/{courseId}")]
        [ProducesResponseType(typeof(ApiResponse<CourseDetailResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetCourseDetail([FromRoute] Guid courseId)
        {
            try
            {
                _logger.LogInformation($"Admin yêu cầu chi tiết khóa học: {courseId}");

                var result = await _courseService.GetCourseDetailAsync(courseId);
                
                if (result == null)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse(
                        "Không tìm thấy khóa học"
                    ));
                }

                return Ok(ApiResponse<CourseDetailResponseDto>.SuccessResponse(
                    result,
                    "Lấy thông tin khóa học thành công"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi lấy chi tiết khóa học {courseId}");
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "Đã xảy ra lỗi khi lấy thông tin khóa học"
                ));
            }
        }

        /// <summary>
        /// [Admin] Tạo một khóa học mới
        /// </summary>
        /// <param name="request">Thông tin khóa học cần tạo</param>
        /// <returns>Thông tin khóa học vừa được tạo</returns>
        [HttpPost("v1/courses")]
        [ProducesResponseType(typeof(ApiResponse<CourseResponseDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreateCourse([FromBody] CreateCourseRequestDto request)
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

                _logger.LogInformation($"Admin {userId} tạo khóa học mới");

                var result = await _courseService.CreateCourseAsync(request, userId);

                return StatusCode(201, ApiResponse<CourseResponseDto>.SuccessResponse(
                    result,
                    "Tạo khóa học thành công"
                ));
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Yêu cầu tạo khóa học không hợp lệ");
                return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo khóa học");
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "Đã xảy ra lỗi khi tạo khóa học"
                ));
            }
        }

        /// <summary>
        /// [Admin] Cập nhật thông tin một khóa học hiện có
        /// </summary>
        /// <param name="courseId">ID của khóa học cần cập nhật</param>
        /// <param name="request">Thông tin cần cập nhật (học phí, trạng thái)</param>
        /// <returns>Thông tin khóa học sau khi cập nhật</returns>
        [HttpPut("v1/courses/{courseId}")]
        [ProducesResponseType(typeof(ApiResponse<CourseResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateCourse(
            [FromRoute] Guid courseId,
            [FromBody] UpdateCourseRequestDto request)
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

                _logger.LogInformation($"Admin {userId} cập nhật khóa học {courseId}");

                var result = await _courseService.UpdateCourseAsync(courseId, request, userId);

                return Ok(ApiResponse<CourseResponseDto>.SuccessResponse(
                    result,
                    "Cập nhật khóa học thành công"
                ));
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, $"Yêu cầu cập nhật khóa học {courseId} không hợp lệ");
                return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi cập nhật khóa học {courseId}");
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "Đã xảy ra lỗi khi cập nhật khóa học"
                ));
            }
        }

        /// <summary>
        /// [Admin] Xóa mềm một khóa học
        /// </summary>
        /// <param name="courseId">ID của khóa học cần xóa</param>
        /// <returns>Kết quả xóa thành công hoặc thất bại</returns>
        [HttpDelete("v1/courses/{courseId}")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteCourse([FromRoute] Guid courseId)
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

                _logger.LogInformation($"Admin {userId} xóa khóa học {courseId}");

                var result = await _courseService.DeleteCourseAsync(courseId, userId);

                if (result)
                {
                    return Ok(ApiResponse<object>.SuccessResponse(
                        new { courseId, isDeleted = true, deletedAt = DateTime.UtcNow },
                        "Xóa khóa học thành công"
                    ));
                }

                return NotFound(ApiResponse<object>.ErrorResponse(
                    "Không tìm thấy khóa học"
                ));
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, $"Không thể xóa khóa học {courseId}");
                return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi xóa khóa học {courseId}");
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "Đã xảy ra lỗi khi xóa khóa học"
                ));
            }
        }

        /// <summary>
        /// [Admin] Thay đổi trạng thái của một khóa học
        /// </summary>
        /// <param name="courseId">ID của khóa học</param>
        /// <param name="request">Trạng thái mới (active, inactive, completed, cancelled)</param>
        /// <returns>Thông tin khóa học với trạng thái mới</returns>
        [HttpPatch("v1/courses/{courseId}/status")]
        [ProducesResponseType(typeof(ApiResponse<CourseResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ChangeCourseStatus(
            [FromRoute] Guid courseId,
            [FromBody] ChangeCourseStatusRequestDto request)
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

                _logger.LogInformation($"Admin {userId} thay đổi trạng thái khóa học {courseId} thành {request.CourseStatus}");

                var result = await _courseService.ChangeCourseStatusAsync(courseId, request, userId);

                return Ok(ApiResponse<CourseResponseDto>.SuccessResponse(
                    result,
                    "Cập nhật trạng thái khóa học thành công"
                ));
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, $"Không thể thay đổi trạng thái khóa học {courseId}");
                return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi thay đổi trạng thái khóa học {courseId}");
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "Đã xảy ra lỗi khi thay đổi trạng thái khóa học"
                ));
            }
        }

        /// <summary>
        /// [Admin] Lấy thống kê chi tiết của một khóa học
        /// </summary>
        /// <param name="courseId">ID của khóa học</param>
        /// <returns>Thống kê chi tiết bao gồm số lớp, số sinh viên, tỷ lệ lấp đầy và doanh thu</returns>
        [HttpGet("v1/courses/{courseId}/statistics")]
        [ProducesResponseType(typeof(ApiResponse<CourseStatisticsDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetCourseStatistics([FromRoute] Guid courseId)
        {
            try
            {
                _logger.LogInformation($"Admin yêu cầu thống kê khóa học {courseId}");

                var result = await _courseService.GetCourseStatisticsAsync(courseId);

                return Ok(ApiResponse<CourseStatisticsDto>.SuccessResponse(
                    result,
                    "Lấy thống kê khóa học thành công"
                ));
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, $"Không tìm thấy khóa học {courseId}");
                return NotFound(ApiResponse<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi lấy thống kê khóa học {courseId}");
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "Đã xảy ra lỗi khi lấy thống kê khóa học"
                ));
            }
        }


    }
}