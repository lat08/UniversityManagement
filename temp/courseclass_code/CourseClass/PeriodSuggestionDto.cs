namespace EduManagement.Core.Application.DTOs.CourseClass;

/// <summary>
/// DTO for period suggestion details
/// </summary>
public class PeriodSuggestionDto
{
    public Guid RoomId { get; set; }
    public string RoomName { get; set; } = string.Empty;
    public string RoomType { get; set; } = string.Empty;
    public string BuildingName { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public string Period { get; set; } = string.Empty; // "morning", "afternoon", "evening"
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public bool IsAvailable { get; set; }
    public int StartPeriod { get; set; }
    public int EndPeriod { get; set; }
}