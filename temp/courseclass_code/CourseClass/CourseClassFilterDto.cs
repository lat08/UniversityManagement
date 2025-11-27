namespace EduManagement.Core.Application.DTOs.CourseClass;

public class CourseClassFilterDto
{
    public Guid? SemesterId { get; set; }
    public Guid? CourseId { get; set; }
    public Guid? InstructorId { get; set; }
    public Guid? RoomId { get; set; }
    public int? DayOfWeek { get; set; }
    public string? Status { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}