// Core/Application/DTOs/Course/CreateCourseRequestDto.cs
namespace EduManagement.Core.Application.DTOs.Course
{
    public class UpdateCourseRequestDto
        {
            public decimal FeePerCredit { get; set; }
            public string CourseStatus { get; set; } = string.Empty;
        }
}