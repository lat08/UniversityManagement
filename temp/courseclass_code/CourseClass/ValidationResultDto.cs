using System.Collections.Generic;

namespace EduManagement.Core.Application.DTOs.CourseClass;

public class ValidationResultDto
{
    public bool IsValid { get; set; }
    public List<ConflictDto> Conflicts { get; set; } = new();
}

public class ConflictDto
{
    public string Type { get; set; } = null!;
    public ConflictingCourseClassDto ConflictingCourseClass { get; set; } = null!;
}

public class ConflictingCourseClassDto
{
    public Guid CourseClassId { get; set; }
    public string SubjectName { get; set; } = null!;
    public string? RoomCode { get; set; }
    public string? InstructorName { get; set; }
    public int DayOfWeek { get; set; }
    public string Periods { get; set; } = null!;
}