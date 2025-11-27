// Core/Application/DTOs/Course/CreateCourseRequestDto.cs
namespace EduManagement.Core.Application.DTOs.Course
{
    public class CourseClassInfoDto
    {
        public Guid CourseClassId { get; set; }
        public string CourseClassCode { get; set; } = string.Empty;
        public string InstructorName { get; set; } = string.Empty;
        public string RoomCode { get; set; } = string.Empty;
        public string RoomName { get; set; } = string.Empty;
        
        // Formatted display properties
        public string Room { get; set; } = string.Empty; // Combined room display
        public string Schedule { get; set; } = string.Empty; // Formatted schedule display
        public string Status { get; set; } = string.Empty; // Course class status
        
        public int DayOfWeek { get; set; }
        public int StartPeriod { get; set; }
        public int EndPeriod { get; set; }
        public DateTime DateStart { get; set; }
        public DateTime DateEnd { get; set; }
        public string StartDate { get; set; } = string.Empty; // Formatted start date
        public string EndDate { get; set; } = string.Empty; // Formatted end date
        
        public int MaxStudents { get; set; }
        public int CurrentStudents { get; set; }
        public int CurrentEnrollment { get; set; } // Alias for CurrentStudents
        
        public string CourseClassStatus { get; set; } = string.Empty;
    }
}