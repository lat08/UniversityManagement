using System.ComponentModel.DataAnnotations;

namespace EduManagement.Core.Application.DTOs.CourseClass;

/// <summary>
/// DTO for updating an existing course class
/// </summary>
public class UpdateCourseClassRequestDto
{
    [Required(ErrorMessage = "Cần cung cấp ID phòng học")]
    public Guid RoomId { get; set; }

    [Required(ErrorMessage = "Cần cung cấp ngày bắt đầu")]
    public DateOnly StartDate { get; set; }

    [Required(ErrorMessage = "Cần cung cấp số lượng sinh viên tối đa")]
    [Range(1, 300, ErrorMessage = "Số lượng sinh viên tối đa phải từ 1 đến 300")]
    public int MaxStudents { get; set; }

    /// <summary>
    /// Khung giờ học: "morning" (buổi sáng), "afternoon" (buổi chiều), hoặc "evening" (buổi tối)
    /// Quyết định lịch học và ảnh hưởng đến ngày kết thúc:
    /// - Sáng (7:15-11:50, tiết 1-5): 5 tiết/tuần = hoàn thành nhanh hơn
    /// - Chiều (13:30-18:00, tiết 6-10): 5 tiết/tuần
    /// - Tối (18:05-20:45, tiết 11-13): 3 tiết/tuần = hoàn thành chậm hơn
    /// </summary>
    [Required(ErrorMessage = "Cần cung cấp khung giờ học")]
    [RegularExpression("^(morning|afternoon|evening)$", 
        ErrorMessage = "Khung giờ học phải là 'morning', 'afternoon', hoặc 'evening'")]
    public string PeriodRange { get; set; } = null!;
    
    /// <summary>
    /// Trạng thái lớp học phần: "active" (đang hoạt động), "inactive" (không hoạt động), "completed" (đã hoàn thành), "cancelled" (đã hủy)
    /// </summary>
    [RegularExpression("^(active|inactive|completed|cancelled)$", 
        ErrorMessage = "Trạng thái phải là 'active', 'inactive', 'completed', hoặc 'cancelled'")]
    public string? CourseClassStatus { get; set; }
}