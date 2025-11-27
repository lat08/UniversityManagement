namespace EduManagement.Core.Application.DTOs.CourseClass;

public class InstructorCourseClassFilterDto
{
    public Guid InstructorId { get; set; }
    
    // Search
    public string? SearchTerm { get; set; } // course_class_code, subject_name
    
    // Filters
    public Guid? SubjectId { get; set; }
    public Guid? SemesterId { get; set; }
    public string? CourseClassStatus { get; set; }
    
    // Pagination
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

