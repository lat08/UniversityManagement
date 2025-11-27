// Core/Application/DTOs/Course/CreateCourseRequestDto.cs
namespace EduManagement.Core.Application.DTOs.Course
{
    public class CourseSemesterInfoDto
    {
        public Guid SemesterId { get; set; }
        public string SemesterName { get; set; } = string.Empty;
        public string SemesterType { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime RegistrationStartDate { get; set; }
        public DateTime RegistrationEndDate { get; set; }
    }
}