// Core/Application/DTOs/Course/CreateCourseRequestDto.cs
namespace EduManagement.Core.Application.DTOs.Course
{
    public class CourseSummaryStatisticsDto
    {
        public int TotalCourses { get; set; }
        public int ActiveCourses { get; set; }
        public int CompletedCourses { get; set; }
        public int CancelledCourses { get; set; }
        public int TotalStudentsEnrolled { get; set; }
        public decimal TotalRevenue { get; set; }
    }
}