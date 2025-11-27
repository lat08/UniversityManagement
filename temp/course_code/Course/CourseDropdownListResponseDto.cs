namespace EduManagement.Core.Application.DTOs.Course
{
    /// <summary>
    /// DTO for paginated course dropdown list response
    /// </summary>
    public class CourseDropdownListResponseDto
    {
        public List<CourseDropdownResponseDto> Courses { get; set; } = new();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public bool HasPreviousPage { get; set; }
        public bool HasNextPage { get; set; }
    }
}