// Core/Application/DTOs/Course/CreateCourseRequestDto.cs
namespace EduManagement.Core.Application.DTOs.Course
{
    public class CourseStatisticsDto
        {
            public Guid CourseId { get; set; }
            public int TotalClasses { get; set; }
            public int TotalStudentsEnrolled { get; set; }
            public decimal AverageClassSize { get; set; }
            public int TotalCapacity { get; set; }
            public decimal OccupancyRate { get; set; }
            public decimal TotalRevenue { get; set; }
            public List<ClassBreakdownDto> CourseClassesBreakdown { get; set; } = new();
        }
}