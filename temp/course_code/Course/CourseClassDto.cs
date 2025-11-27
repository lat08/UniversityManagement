namespace EduManagement.Core.Application.DTOs.Course
{
    public class CourseClassDto
    {
        public Guid CourseClassId { get; set; }
        public string CourseClassCode { get; set; } = string.Empty;
        public string InstructorName { get; set; } = string.Empty;
        public int EnrolledStudents { get; set; }
        public int MaximumStudents { get; set; }
        public string Room { get; set; } = string.Empty; // Format: "Building - Room"
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public int DayOfWeek { get; set; }
        public int StartPeriod { get; set; }
        public int EndPeriod { get; set; }
        public string CourseClassStatus { get; set; } = string.Empty;

        public DateOnly? InstructorAssignedAt { get; set; }
        public string? Note { get; set; }
    }
}