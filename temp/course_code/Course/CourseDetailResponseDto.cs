// Core/Application/DTOs/Course/CreateCourseRequestDto.cs
namespace EduManagement.Core.Application.DTOs.Course
{
    public class CourseDetailResponseDto
    {
        public Guid CourseId { get; set; }
        
        // Nested objects for structured access
        public SubjectInfoDto Subject { get; set; } = new();
        public CourseSemesterInfoDto Semester { get; set; } = new();
        
        // Flattened properties for backward compatibility and easy display
        public string CourseName { get; set; } = string.Empty; // Subject name
        public string CourseCode { get; set; } = string.Empty; // Subject code
        public string SubjectName { get; set; } = string.Empty; // Same as CourseName
        public string SubjectCode { get; set; } = string.Empty; // Same as CourseCode
        public int Credits { get; set; }
        public string SemesterName { get; set; } = string.Empty;
        public string AcademicYear { get; set; } = string.Empty;
        
        public decimal FeePerCredit { get; set; }
        public decimal TotalFee { get; set; }
        public string CourseStatus { get; set; } = string.Empty;
        public List<CourseClassInfoDto> CourseClasses { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}