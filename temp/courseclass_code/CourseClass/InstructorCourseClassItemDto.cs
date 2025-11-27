namespace EduManagement.Core.Application.DTOs.CourseClass;

public class InstructorCourseClassItemDto
{
    public Guid CourseClassId { get; set; }
    public string CourseClassCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public Guid SubjectId { get; set; }
    
    public string InstructorName { get; set; } = string.Empty;
    public Guid InstructorId { get; set; }
    
    public DateOnly? AssignedDate { get; set; } // instructor_assigned_at
    public string? Note { get; set; }
    
    public string SemesterName { get; set; } = string.Empty;
    public Guid SemesterId { get; set; }
    
    public string CourseClassStatus { get; set; } = string.Empty;
    
    public int StudentsEnrolled { get; set; }
    public int MaxStudents { get; set; }
}

