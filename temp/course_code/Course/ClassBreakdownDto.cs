// Core/Application/DTOs/Course/CreateCourseRequestDto.cs
namespace EduManagement.Core.Application.DTOs.Course
{
    public class ClassBreakdownDto
    {
        public Guid CourseClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public int CurrentStudents { get; set; }
        public int MaxStudents { get; set; }
        public decimal OccupancyRate { get; set; }
    }
}