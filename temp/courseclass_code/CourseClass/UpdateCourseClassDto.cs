namespace EduManagement.Core.Application.DTOs.CourseClass;

public class UpdateCourseClassDto
{
    public Guid? InstructorId { get; set; }
    public Guid RoomId { get; set; }
    public DateOnly DateStart { get; set; }
    public DateOnly DateEnd { get; set; }
    public int MaxStudents { get; set; }
    public int DayOfWeek { get; set; }
    public int StartPeriod { get; set; }
    public int EndPeriod { get; set; }
    public string? CourseClassStatus { get; set; } // active, inactive, completed, cancelled
}