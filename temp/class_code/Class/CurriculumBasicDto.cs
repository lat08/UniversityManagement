using System;

namespace EduManagement.Core.Application.DTOs.Class;

public class CurriculumBasicDto
{
    public Guid CurriculumId { get; set; }
    public string CurriculumName { get; set; } = null!;
}