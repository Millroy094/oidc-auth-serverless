import get from 'lodash/get';
import has from 'lodash/has';
import { Plus, Trash2 } from 'lucide-react';
import {
  ArrayPath,
  Control,
  Controller,
  FieldErrors,
  FieldValues,
  Path,
  UseFormSetValue,
  UseFormWatch,
  useFieldArray,
} from 'react-hook-form';
import MultiSelect from './MultiSelect';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { IAdminResourceListItem } from '@/api/admin/get-resources';

export interface IResourceScopeInput {
  id: string;
  scopes: string[];
}

interface ResourceScopesFieldValues {
  resources: IResourceScopeInput[];
}

interface ResourceScopesFieldProps<
  TFieldValues extends FieldValues & ResourceScopesFieldValues,
> {
  control: Control<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  setValue: UseFormSetValue<TFieldValues>;
  watch: UseFormWatch<TFieldValues>;
  resources: IAdminResourceListItem[];
}

const ResourceScopesField = <
  TFieldValues extends FieldValues & ResourceScopesFieldValues,
>(
  props: ResourceScopesFieldProps<TFieldValues>,
) => {
  const { control, errors, setValue, watch, resources } = props;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'resources' as ArrayPath<TFieldValues>,
  });

  const selectedResources = watch('resources' as Path<TFieldValues>) as
    IResourceScopeInput[] | undefined;

  const usedResourceIds = (selectedResources ?? []).map((entry) => entry.id);

  const canAddRow = fields.length < resources.length;

  const resourceOptionsFor = (currentId: string) =>
    resources
      .filter(
        (resource) =>
          resource.id === currentId || !usedResourceIds.includes(resource.id),
      )
      .map((resource) => ({ label: resource.name, value: resource.id }));

  const scopeOptionsFor = (resourceId: string) => {
    const resource = resources.find((entry) => entry.id === resourceId);
    return (resource?.scopes ?? []).map((scope) => ({
      label: scope,
      value: scope,
    }));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Resource Access</Label>
        {canAddRow && (
          <button
            type="button"
            onClick={() => append({ id: '', scopes: [] } as never)}
            className="p-2 text-green-600 hover:bg-green-100 rounded"
            title="Add"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No resource access configured.
        </p>
      )}

      {fields.map((field, index) => {
        const currentId = selectedResources?.[index]?.id ?? '';

        return (
          <div
            key={field.id}
            className="flex items-start gap-2 rounded-lg border p-3"
          >
            <div className="min-w-0 flex-1 space-y-2">
              <Controller
                control={control}
                name={`resources.${index}.id` as Path<TFieldValues>}
                render={({ field: controllerField }) => (
                  <Select
                    value={controllerField.value}
                    onValueChange={(value) => {
                      controllerField.onChange(value);
                      setValue(
                        `resources.${index}.scopes` as Path<TFieldValues>,
                        [] as never,
                      );
                    }}
                  >
                    <SelectTrigger
                      className={
                        has(errors, `resources.${index}.id`)
                          ? 'border-destructive'
                          : ''
                      }
                    >
                      <SelectValue placeholder="Select resource" />
                    </SelectTrigger>
                    <SelectContent>
                      {resourceOptionsFor(currentId).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {has(errors, `resources.${index}.id`) && (
                <p className="text-sm text-destructive">
                  {String(get(errors, `resources.${index}.id.message`, ''))}
                </p>
              )}

              <Controller
                control={control}
                name={`resources.${index}.scopes` as Path<TFieldValues>}
                render={({ field: controllerField }) => (
                  <MultiSelect
                    options={scopeOptionsFor(currentId)}
                    value={(controllerField.value as string[]) ?? []}
                    onChange={controllerField.onChange}
                    placeholder="Select scopes"
                    invalid={has(errors, `resources.${index}.scopes`)}
                  />
                )}
              />
              {has(errors, `resources.${index}.scopes`) && (
                <p className="text-sm text-destructive">
                  {String(get(errors, `resources.${index}.scopes.message`, ''))}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => remove(index)}
              className="p-2 text-red-600 hover:bg-red-100 rounded"
              title="Remove"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ResourceScopesField;
