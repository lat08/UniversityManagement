// Core/Application/DTOs/Course/CreateCourseRequestDto.cs
namespace EduManagement.Core.Application.DTOs.Course
{
    public class SubjectInfoDto
    {
        public Guid SubjectId { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public string SubjectCode { get; set; } = string.Empty;
        public int Credits { get; set; }
        public int TheoryHours { get; set; }
        public int PracticeHours { get; set; }
        public Guid DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
    }
}