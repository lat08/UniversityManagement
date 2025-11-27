namespace EduManagement.Core.Application.DTOs.CourseClass;

/// <summary>
/// DTO for schedule suggestion response
/// </summary>
public class ScheduleSuggestionResponseDto
{
    public List<PeriodSuggestionDto> Suggestions { get; set; } = new List<PeriodSuggestionDto>();
    public DateOnly RequestedDate { get; set; }
    public string DayOfWeek { get; set; } = string.Empty;
    public int TotalSuggestions { get; set; }
}