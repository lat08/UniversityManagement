namespace EduManagement.Core.Application.DTOs.CourseClass;

public class ValidateScheduleDto
{
    public Guid RoomId { get; set; }
    public Guid? InstructorId { get; set; }
    public DateOnly DateStart { get; set; }
    public DateOnly DateEnd { get; set; }
    public int DayOfWeek { get; set; }
    public int StartPeriod { get; set; }
    public int EndPeriod { get; set; }
    public Guid? ExcludeCourseClassId { get; set; }
}