import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { UserModel } from './user.model';

export interface AcademicRecord {
    record_id: string;
    user_id: string;
    academic_profile: 'schooling' | 'college';
    class_name?: string | null;
    board?: string | null;
    degree?: string | null;
    university?: string | null;
    percentage: number;
    grade?: string | null;
    certificate_path?: string | null;
    storage_type?: 'local' | 's3' | null;
    created_at?: Date;
    updated_at?: Date;
}

type AcademicRecordCreationAttributes = Optional<
    AcademicRecord,
    | 'record_id'
    | 'class_name'
    | 'board'
    | 'degree'
    | 'university'
    | 'grade'
    | 'certificate_path'
    | 'storage_type'
    | 'created_at'
    | 'updated_at'
>;

export class AcademicRecordModel
    extends Model<AcademicRecord, AcademicRecordCreationAttributes>
    implements AcademicRecord
{
    public record_id!: string;
    public user_id!: string;
    public academic_profile!: 'schooling' | 'college';
    public class_name?: string | null;
    public board?: string | null;
    public degree?: string | null;
    public university?: string | null;
    public percentage!: number;
    public grade?: string | null;
    public certificate_path?: string | null;
    public storage_type?: 'local' | 's3' | null;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    public user?: UserModel;
}

export default function (sequelize: Sequelize): typeof AcademicRecordModel {
    AcademicRecordModel.init(
        {
            record_id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            user_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'user_id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            academic_profile: {
                type: DataTypes.ENUM('schooling', 'college'),
                allowNull: false,
            },
            class_name: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            board: {
                type: DataTypes.STRING(120),
                allowNull: true,
            },
            degree: {
                type: DataTypes.STRING(120),
                allowNull: true,
            },
            university: {
                type: DataTypes.STRING(200),
                allowNull: true,
            },
            percentage: {
                type: DataTypes.FLOAT,
                allowNull: false,
            },
            grade: {
                type: DataTypes.STRING(20),
                allowNull: true,
            },
            certificate_path: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            storage_type: {
                type: DataTypes.ENUM('local', 's3'),
                allowNull: true,
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: Sequelize.literal('NOW()'),
            },
            updated_at: {
                type: DataTypes.DATE,
                defaultValue: Sequelize.literal('NOW()'),
            },
        },
        {
            tableName: 'academic_records',
            sequelize,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            indexes: [
                { fields: ['user_id'] },
                { fields: ['academic_profile'] },
            ],
        },
    );

    return AcademicRecordModel;
}
