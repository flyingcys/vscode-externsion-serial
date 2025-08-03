import { Group, Dataset, Action, ValidationResult } from '../types/ProjectTypes';
/**
 * 项目验证器类
 * 提供JSON Schema验证和业务逻辑验证
 */
export declare class ProjectValidator {
    private ajv;
    private projectSchema;
    constructor();
    /**
     * 验证完整项目配置
     */
    validateProject(project: any): ValidationResult;
    /**
     * 验证组群配置
     */
    validateGroup(group: Group): ValidationResult;
    /**
     * 验证数据集配置
     */
    validateDataset(dataset: Dataset): ValidationResult;
    /**
     * 验证动作配置
     */
    validateAction(action: Action): ValidationResult;
    /**
     * 业务逻辑验证
     */
    private validateBusinessLogic;
    /**
     * 创建项目JSON Schema
     */
    private createProjectSchema;
}
//# sourceMappingURL=ProjectValidator.d.ts.map