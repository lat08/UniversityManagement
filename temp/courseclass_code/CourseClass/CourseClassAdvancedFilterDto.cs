namespace EduManagement.Core.Application.DTOs.CourseClass;

public class CourseClassAdvancedFilterDto
{
    // Search fields
    public string? SearchTerm { get; set; } // Searches course_class_code, subject_name, instructor_name
    
    // Filter fields
    public Guid? SubjectId { get; set; }
    public Guid? InstructorId { get; set; }
    public Guid? SemesterId { get; set; }
    public string? CourseClassStatus { get; set; }
    
    // Pagination
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    
    // Sorting
    public string? SortBy { get; set; } // course_class_code, subject_name, students_enrolled, semester_name
    public string? SortOrder { get; set; } = "asc"; // asc, desc
}

