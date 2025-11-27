namespace EduManagement.Core.Application.DTOs.Course
{
    /// <summary>
    /// DTO for course dropdown response
    /// </summary>
    public class CourseDropdownResponseDto
    {
        public Guid CourseId { get; set; }
        public string DisplayName { get; set; } = string.Empty; // Format: "SubjectName - CourseCode"
    }
}