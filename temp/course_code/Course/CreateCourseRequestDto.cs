using System.ComponentModel.DataAnnotations;

// Core/Application/DTOs/Course/CreateCourseRequestDto.cs
namespace EduManagement.Core.Application.DTOs.Course
{
    public class CreateCourseRequestDto
    {
        [Required(ErrorMessage = "Subject ID is required")]
        public Guid SubjectId { get; set; }
        
        [Required(ErrorMessage = "Semester ID is required")]
        public Guid SemesterId { get; set; }
        
        [Required(ErrorMessage = "Course code is required")]
        [StringLength(50, ErrorMessage = "Course code cannot exceed 50 characters")]
        public string CourseCode { get; set; } = string.Empty;
        
        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
        public string? Description { get; set; }
        
        [Range(0.01, double.MaxValue, ErrorMessage = "Fee per credit must be greater than 0")]
        public decimal FeePerCredit { get; set; } = 0;
        
        [RegularExpression("^(active|inactive|completed)$", ErrorMessage = "Status must be 'active', 'inactive', or 'completed'")]
        public string CourseStatus { get; set; } = "active";
    }
}