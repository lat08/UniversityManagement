using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EduManagement.Core.Application.DTOs.Class;
using EduManagement.Core.Domain.Entities;

namespace EduManagement.Core.Application.Interfaces.Repositories;

public interface IClassRepository
{
    Task<Class?> GetByIdAsync(Guid id);
    Task<Class?> GetByIdWithDetailsAsync(Guid id);
    Task<List<Class>> GetAllWithDetailsAsync(ClassFilterDto filter);
    Task<int> GetTotalCountAsync(ClassFilterDto filter);
    Task<Class> CreateAsync(Class classEntity);
    Task<Class> UpdateAsync(Class classEntity);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> IsClassCodeUniqueAsync(string classCode, Guid? excludeClassId = null);
    Task<bool> HasActiveStudentsAsync(Guid classId);
    Task<bool> IsAdvisorFromSameDepartmentAsync(Guid advisorId, Guid departmentId);
    Task<bool> IsCurriculumFromSameDepartmentAsync(Guid curriculumId, Guid departmentId);
    Task<int> GetStudentCountAsync(Guid classId);
    Task<List<InstructorBasicDto>> GetAvailableInstructorsByDepartmentIdAsync(Guid departmentId);
    Task<List<CurriculumBasicDto>> GetAvailableCurriculumsByDepartmentIdAsync(Guid departmentId);
    Task<Guid> GetOrCreateEndAcademicYearAsync(Guid startAcademicYearId);
    Task<bool> TrainingSystemExistsAsync(Guid trainingSystemId);
    Task<List<TrainingSystemBasicDto>> GetAvailableTrainingSystemsAsync();
}

