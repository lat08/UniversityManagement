namespace EduManagement.Core.Application.DTOs.CourseClass;

public class CreateCourseClassDto
{
    public Guid CourseId { get; set; }
    public Guid? InstructorId { get; set; }
    public Guid RoomId { get; set; }
    public DateOnly DateStart { get; set; }
    public DateOnly DateEnd { get; set; }
    public int MaxStudents { get; set; }
    public int DayOfWeek { get; set; }
    public int StartPeriod { get; set; }
    public int EndPeriod { get; set; }
}