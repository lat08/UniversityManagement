using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EduManagement.Core.Application.DTOs.Class;

namespace EduManagement.Core.Application.Interfaces.Services;

public interface IClassService
{
    Task<ClassListResponseDto> GetAllClassesAsync(ClassFilterDto filter);
    Task<ClassDetailDto?> GetClassByIdAsync(Guid id);
    Task<ClassDetailDto> CreateClassAsync(CreateClassDto dto);
    Task<ClassDetailDto> UpdateClassAsync(Guid id, UpdateClassDto dto);
    Task<bool> DeleteClassAsync(Guid id);
    Task<List<InstructorBasicDto>> GetAvailableInstructorsByDepartmentIdAsync(Guid departmentId);
    Task<List<CurriculumBasicDto>> GetAvailableCurriculumsByDepartmentIdAsync(Guid departmentId);
    Task<List<TrainingSystemBasicDto>> GetAvailableTrainingSystemsAsync();
}

