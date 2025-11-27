namespace EduManagement.Core.Application.DTOs.CourseClass;

/// <summary>
/// DTO for student information in course class
/// </summary>
public class CourseClassStudentDto
{
    public Guid StudentId { get; set; }
    public string StudentCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string EnrollmentStatus { get; set; } = string.Empty;
    public DateTime EnrollmentDate { get; set; }
}