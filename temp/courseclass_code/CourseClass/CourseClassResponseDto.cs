namespace EduManagement.Core.Application.DTOs.CourseClass;

/// <summary>
/// DTO for course class response
/// </summary>
public class CourseClassResponseDto
{
    public Guid CourseClassId { get; set; }
    public string CourseClassCode { get; set; } = string.Empty;
    public Guid CourseId { get; set; }
    public string CourseName { get; set; } = string.Empty;
    public Guid RoomId { get; set; }
    public string RoomName { get; set; } = string.Empty;
    public string BuildingName { get; set; } = string.Empty;
    public Guid InstructorId { get; set; }
    public string InstructorName { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public string DayOfWeek { get; set; } = string.Empty;
    public int MaxStudents { get; set; }
    public int EnrolledStudents { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}