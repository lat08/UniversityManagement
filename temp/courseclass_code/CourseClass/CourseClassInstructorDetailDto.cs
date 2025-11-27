namespace EduManagement.Core.Application.DTOs.CourseClass;

public class CourseClassInstructorDetailDto
{
    public Guid CourseClassId { get; set; }
    public string CourseClassCode { get; set; } = string.Empty;
    
    public string SubjectName { get; set; } = string.Empty;
    public Guid SubjectId { get; set; }
    
    public string? InstructorName { get; set; }
    public Guid? InstructorId { get; set; }
    public string? InstructorCode { get; set; }
    public string? InstructorEmail { get; set; }
    public string? InstructorPhone { get; set; }
    
    public DateOnly? AssignedDate { get; set; }
    public string? Note { get; set; }
    
    public string SemesterName { get; set; } = string.Empty;
    public Guid SemesterId { get; set; }
}

