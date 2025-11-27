// DTOs/CourseClass/CreateCourseClassRequestDto.cs
using System.ComponentModel.DataAnnotations;

namespace EduManagement.Core.Application.DTOs.CourseClass;

/// <summary>
/// DTO cho việc tạo lớp học phần mới KHÔNG có giảng viên
/// Giảng viên sẽ được gán sau qua API riêng
/// </summary>
public class CreateCourseClassRequestDto
{
    [Required(ErrorMessage = "Cần cung cấp ID khóa học")]
    public Guid CourseId { get; set; }

    [Required(ErrorMessage = "Cần cung cấp ID phòng học")]
    public Guid RoomId { get; set; }

    [Required(ErrorMessage = "Cần cung cấp ngày bắt đầu")]
    public DateOnly StartDate { get; set; }

    [Required(ErrorMessage = "Cần cung cấp số lượng sinh viên tối đa")]
    [Range(1, 300, ErrorMessage = "Số lượng sinh viên tối đa phải từ 1 đến 300")]
    public int MaxStudents { get; set; }

    /// <summary>
    /// Khung giờ học: "morning" (buổi sáng), "afternoon" (buổi chiều), hoặc "evening" (buổi tối)
    /// </summary>
    [Required(ErrorMessage = "Cần cung cấp khung giờ học")]
    [RegularExpression("^(morning|afternoon|evening)$", 
        ErrorMessage = "Khung giờ học phải là 'morning', 'afternoon', hoặc 'evening'")]
    public string PeriodRange { get; set; } = null!;
}

// DTOs/CourseClass/AssignInstructorRequestDto.cs
/// <summary>
/// DTO for assigning instructor to a course class
/// </summary>
public class AssignInstructorRequestDto
{
    public Guid InstructorId { get; set; }
    
    /// <summary>
    /// Ngày gán giảng viên (mặc định là hôm nay)
    /// </summary>
    public DateOnly? AssignedDate { get; set; }  // Changed from DateTime to DateOnly
    
    /// <summary>
    /// Ghi chú về việc gán giảng viên
    /// </summary>
    public string? Note { get; set; }
}
