namespace EduManagement.Core.Application.DTOs.CourseClass;

public class CourseClassListItemDto
{
    public Guid CourseClassId { get; set; }
    public string CourseClassCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public Guid SubjectId { get; set; }
    
    public string? InstructorName { get; set; }
    public Guid? InstructorId { get; set; }
    public DateOnly? InstructorAssignedDate { get; set; }
    public string? Note { get; set; }
    
    public int StudentsEnrolled { get; set; }
    public int MaxStudents { get; set; }
    
    public string SemesterName { get; set; } = string.Empty;
    public Guid SemesterId { get; set; }
    
    public string CourseClassStatus { get; set; } = string.Empty;
    
    // Schedule info
    public int DayOfWeek { get; set; }
    public string DayOfWeekName { get; set; } = string.Empty;
    public string PeriodRange { get; set; } = string.Empty;
}

