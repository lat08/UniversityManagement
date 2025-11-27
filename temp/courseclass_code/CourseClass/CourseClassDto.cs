using System;

namespace EduManagement.Core.Application.DTOs.CourseClass;

public class CourseClassDto
{
    public Guid CourseClassId { get; set; }
    public CourseInfoDto Course { get; set; } = null!;
    public InstructorInfoDto? Instructor { get; set; }
    public RoomInfoDto Room { get; set; } = null!;
    public ScheduleInfoDto Schedule { get; set; } = null!;
    public EnrollmentInfoDto EnrollmentInfo { get; set; } = null!;
    public string? CourseClassStatus { get; set; }

    public DateOnly? InstructorAssignedAt { get; set; }
    public string? Note { get; set; }
}

public class CourseInfoDto
{
    public Guid CourseId { get; set; }
    public string SubjectCode { get; set; } = null!;
    public string SubjectName { get; set; } = null!;
    public int Credits { get; set; }
    public Guid SemesterId { get; set; }
    public string SemesterName { get; set; } = null!;
}

public class InstructorInfoDto
{
    public Guid InstructorId { get; set; }
    public string FullName { get; set; } = null!;
    public string InstructorCode { get; set; } = null!;
    public string? Email { get; set; }
}

public class RoomInfoDto
{
    public Guid RoomId { get; set; }
    public string RoomCode { get; set; } = null!;
    public string RoomName { get; set; } = null!;
    public int Capacity { get; set; }
    public string? BuildingName { get; set; }
}

public class ScheduleInfoDto
{
    public int DayOfWeek { get; set; }
    public int StartPeriod { get; set; }
    public int EndPeriod { get; set; }
    public DateOnly DateStart { get; set; }
    public DateOnly DateEnd { get; set; }
    public string DayOfWeekName { get; set; } = null!;
    public string PeriodRange { get; set; } = null!;
}

public class EnrollmentInfoDto
{
    public int CurrentStudents { get; set; }
    public int MaxStudents { get; set; }
    public bool IsFull { get; set; }
}