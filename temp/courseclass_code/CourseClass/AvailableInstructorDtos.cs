using System;
using System.Collections.Generic;

namespace EduManagement.Core.Application.DTOs.CourseClass;

/// <summary>
/// Query DTO for getting available instructors
/// </summary>
public class AvailableInstructorsQueryDto
{
    /// <summary>
    /// Semester ID to check instructor availability
    /// </summary>
    public Guid SemesterId { get; set; }
    
    /// <summary>
    /// Day of week (2=Monday, 3=Tuesday, ..., 8=Sunday)
    /// </summary>
    public int DayOfWeek { get; set; }
    
    /// <summary>
    /// Period range: "morning", "afternoon", or "evening"
    /// </summary>
    public string PeriodRange { get; set; } = string.Empty;
    
    /// <summary>
    /// Subject ID to filter instructors by faculty
    /// </summary>
    public Guid SubjectId { get; set; }
    
    /// <summary>
    /// Course class ID to exclude from conflict checks (for updating existing course class)
    /// </summary>
    public Guid? ExcludeCourseClassId { get; set; }
}

/// <summary>
/// Response DTO for available instructor
/// </summary>
public class AvailableInstructorDto
{
    public Guid InstructorId { get; set; }
    public string InstructorCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public List<AvailableInstructorCourseClassDto> CourseClasses { get; set; } = new();
}

/// <summary>
/// DTO for course class details
/// </summary>
public class AvailableInstructorCourseClassDto
{
    public string SubjectName { get; set; } = string.Empty;
    public Guid CourseClassId { get; set; }
    public string CourseClassCode { get; set; } = string.Empty;
    public string DayOfWeek { get; set; } = string.Empty;
    public string TimePeriod { get; set; } = string.Empty;
}

/// <summary>
/// Response wrapper for available instructors
/// </summary>
public class AvailableInstructorsResponseDto
{
    public List<AvailableInstructorDto> Instructors { get; set; } = new();
    public int TotalCount { get; set; }
    public string PeriodRange { get; set; } = string.Empty;
    public string PeriodRangeDescription { get; set; } = string.Empty;
    public int StartPeriod { get; set; }
    public int EndPeriod { get; set; }
    public string DayOfWeekName { get; set; } = string.Empty;
    public string SemesterName { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
}

/// <summary>
/// Helper class for period range mapping
/// </summary>
public static class PeriodRangeHelper
{
    public static (int startPeriod, int endPeriod, string description) GetPeriodRange(string periodRange)
    {
        return periodRange.ToLower() switch
        {
            "morning" => (1, 5, "Buổi sáng (tiết 1-5)"),
            "afternoon" => (6, 9, "Buổi chiều (tiết 6-9)"),
            "evening" => (10, 12, "Buổi tối (tiết 10-12)"),
            _ => throw new ArgumentException("Period range must be 'morning', 'afternoon', or 'evening'")
        };
    }
    
    public static string GetDayOfWeekName(int dayOfWeek)
    {
        return dayOfWeek switch
        {
            2 => "Thứ 2",
            3 => "Thứ 3",
            4 => "Thứ 4",
            5 => "Thứ 5",
            6 => "Thứ 6",
            7 => "Thứ 7",
            8 => "Chủ nhật",
            _ => "Không xác định"
        };
    }
}