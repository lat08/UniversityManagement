namespace EduManagement.Core.Application.DTOs.Course
{
    public class CourseResponseDto
    {
        public Guid CourseId { get; set; }
        public Guid SubjectId { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public string SubjectCode { get; set; } = string.Empty;
        public int Credits { get; set; }
        public Guid SemesterId { get; set; }
        public string SemesterName { get; set; } = string.Empty;
        
        // Flattened properties for backward compatibility
        public string CourseName { get; set; } = string.Empty; // Same as SubjectName
        public string CourseCode { get; set; } = string.Empty; // Same as SubjectCode
        public string AcademicYear { get; set; } = string.Empty;
        
        public decimal FeePerCredit { get; set; }
        public decimal TotalFee { get; set; }
        public string CourseStatus { get; set; } = string.Empty;
        public int TotalClasses { get; set; }
        public int TotalStudents { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<CourseClassDto> CourseClasses { get; set; } = new List<CourseClassDto>();
    }
}