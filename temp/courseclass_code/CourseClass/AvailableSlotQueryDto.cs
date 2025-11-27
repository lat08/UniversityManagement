using System;

namespace EduManagement.Core.Application.DTOs.CourseClass;

/// <summary>
/// Query DTO for getting available time slots
/// </summary>
public class AvailableSlotQueryDto
{
    public DateOnly DateStart { get; set; }
    public DateOnly DateEnd { get; set; }
    public int? MinCapacity { get; set; }
    public string? RoomType { get; set; }
    public Guid? BuildingId { get; set; }
}

/// <summary>
/// Response DTO for available time slots
/// </summary>
public class AvailableSlotResponseDto
{
    public List<AvailableRoomSlotDto> AvailableSlots { get; set; } = new();
    public int TotalSlots { get; set; }
}

/// <summary>
/// Individual available room with time slots
/// </summary>
public class AvailableRoomSlotDto
{
    public Guid RoomId { get; set; }
    public string RoomCode { get; set; } = string.Empty;
    public string RoomName { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public string RoomType { get; set; } = string.Empty;
    public string BuildingName { get; set; } = string.Empty;
    public Guid BuildingId { get; set; }
    
    public List<TimeSlotDto> AvailableTimeSlots { get; set; } = new();
}

/// <summary>
/// Individual time slot information
/// </summary>
public class TimeSlotDto
{
    public int DayOfWeek { get; set; }
    public string DayOfWeekName { get; set; } = string.Empty;
    public int StartPeriod { get; set; }
    public int EndPeriod { get; set; }
    public string PeriodRange { get; set; } = string.Empty;
    public bool IsAvailable { get; set; }
    public string? ConflictReason { get; set; }
}