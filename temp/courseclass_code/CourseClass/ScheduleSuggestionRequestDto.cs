using System.ComponentModel.DataAnnotations;

namespace EduManagement.Core.Application.DTOs.CourseClass;

/// <summary>
/// DTO for requesting schedule suggestions
/// </summary>
public class ScheduleSuggestionRequestDto
{
    [Required(ErrorMessage = "Date is required")]
    public DateOnly Date { get; set; }

    public Guid? BuildingId { get; set; }

    [StringLength(50, ErrorMessage = "Room type cannot exceed 50 characters")]
    public string? RoomType { get; set; }
}