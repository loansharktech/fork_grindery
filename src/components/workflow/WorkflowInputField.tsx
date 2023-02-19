import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import {
  Alert,
  IconButton,
  RichInput,
  Select,
  Autocomplete,
} from "grindery-ui";
import { Field } from "../../types/Connector";
import useWorkflowContext from "../../hooks/useWorkflowContext";
import useAppContext from "../../hooks/useAppContext";
import { BLOCKCHAINS, ICONS, isLocalOrStaging } from "../../constants";
import { debounce } from "throttle-debounce";
import { jsonrpcObj } from "../../helpers/utils";
import useWorkflowStepContext from "../../hooks/useWorkflowStepContext";

const InputWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  flex-wrap: nowrap;
  width: 100%;
  margin-top: 0px;
  gap: 10px;
  max-width: 100%;
  & > *:first-child {
    flex: 1;
    min-width: 0;
  }
  & > .MuiBox-root > .MuiBox-root {
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
  }
`;

const IconButtonWrapper = styled.div`
  margin-top: 35px;

  & .MuiIconButton-root img {
    width: 16px !important;
    height: 16px !important;
  }
`;

const ReadOnlyWrapper = styled.div`
  & .MuiOutlinedInput-root {
    margin-top: 0px;
  }
`;

const AlertWrapper = styled.div`
  margin-bottom: 16px;
`;

const WarningTitle = styled.h4`
  font-weight: bold;
  font-size: 14px;
  line-height: 150%;
  text-align: left;
  color: #0b0d17;
  padding: 0;
  margin: 0;
`;

const WarningText = styled.p`
  font-weight: 400;
  font-size: 14px;
  line-height: 150%;
  text-align: left;
  color: #0b0d17;
  padding: 0;
  margin: 0;
`;

type Props = {
  type: "action" | "trigger";
  inputField: Field;
  options?: any;
  index?: any;
  addressBook: any;
  setAddressBook?: (i: any) => void;
  setError: (i: string) => void;
  errors: any;
  setErrors: (a: any) => void;
};

const WorkflowInputField = ({
  type,
  inputField,
  options,
  index,
  addressBook,
  setAddressBook,
  setError,
  errors,
  setErrors,
}: Props) => {
  const { user, client, evmChains } = useAppContext();
  const { updateWorkflow, workflow, setLoading } = useWorkflowContext();
  const { connector, setConnector, operation, setOperationIsTested } =
    useWorkflowStepContext();

  const workflowStep =
    type === "trigger" ? workflow.trigger : workflow.actions[index];

  const currentConnector = connector;

  const [valChanged, setValChanged] = useState(false);

  const fieldOptions = inputField.choices?.map((choice) => ({
    value: typeof choice !== "string" ? choice.value : choice,
    label: typeof choice !== "string" ? choice.label : choice,
    icon:
      (typeof choice !== "string" && choice.icon) ||
      currentConnector?.icon ||
      "",
  }));

  const booleanOptions = [
    {
      value: "true",
      label: "True",
      icon: "",
    },
    { value: "false", label: "False", icon: "" },
  ];

  const workflowInputValue =
    type === "trigger"
      ? workflow.trigger.input[inputField.key]
      : workflow.actions[index].input[inputField.key];

  const workflowValue = inputField.list
    ? workflowInputValue || [""]
    : (workflowInputValue || inputField.default || "").toString();

  const [valuesNum, setValuesNum] = useState(
    Array.isArray(workflowValue) && workflowValue.length > 1
      ? [
          ...workflowValue
            .slice(1)
            .filter((e) => e !== "" && typeof e !== "undefined")
            .map((e, i) => i + 1),
        ]
      : []
  );

  const error =
    (errors &&
      typeof errors !== "boolean" &&
      errors.length > 0 &&
      errors.find((error: any) => error && error.field === inputField.key) &&
      (
        errors.find((error: any) => error && error.field === inputField.key)
          .message || ""
      ).replace(`'${inputField.key}'`, "")) ||
    false;

  const handleFieldChange = (value: string, idx?: number) => {
    setError("");
    setErrors(
      typeof errors !== "boolean"
        ? [
            ...errors.filter(
              (error: any) => error && error.field !== inputField.key
            ),
          ]
        : errors
    );

    let newVal: string | number | boolean | (string | number | boolean)[] =
      value.trim();
    if (
      (inputField.type === "string" && inputField.choices) ||
      inputField.type === "boolean"
    ) {
      newVal = (value || "").trim();
      if (inputField.type === "boolean") {
        newVal = newVal === "true";
      }
    }
    if (inputField.type === "string" && !fieldOptions) {
      newVal = value.trim();
    }
    if (inputField.type === "number" && !fieldOptions) {
      newVal = value ? parseFloat(value) : "";
    }
    /*if (inputField.list) {
      newVal = [newVal].filter((val) => val);
    }*/

    const key =
      (type === "trigger"
        ? "trigger.input." + inputField.key
        : "actions[" + index + "].input." + inputField.key) +
      (inputField.list && typeof idx !== "undefined" ? "[" + idx + "]" : "");
    updateWorkflow({
      [key]: newVal || (typeof idx !== "undefined" ? undefined : ""),
    });
    setOperationIsTested(false);
    setValChanged(true);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateFieldsDefinition = useCallback(
    debounce(1000, () => {
      if (
        (typeof inputField.updateFieldDefinition === "undefined" ||
          inputField.updateFieldDefinition) &&
        operation?.operation?.inputFieldProviderUrl
      ) {
        if (workflow) {
          client
            ?.callInputProvider(
              currentConnector?.key || "",
              operation.key,
              jsonrpcObj("grinderyNexusConnectorUpdateFields", {
                key: operation.key,
                fieldData: workflowStep.input || {},
                authentication: workflowStep.authentication,
              }),
              isLocalOrStaging ? "staging" : undefined
            )
            .then((res) => {
              if (res && res.data && res.data.error) {
                console.error(
                  "grinderyNexusConnectorUpdateFields error",
                  res.data.error
                );
              }
              if (res && connector) {
                setConnector({
                  ...connector,
                  actions: [
                    ...(connector.actions || []).map((act) => {
                      if (
                        act.key === operation?.key &&
                        act.operation &&
                        type === "action"
                      ) {
                        return {
                          ...act,
                          operation: {
                            ...act.operation,
                            inputFields:
                              res.inputFields || act.operation.inputFields,
                            outputFields:
                              res.outputFields && res.outputFields.length > 0
                                ? res.outputFields
                                : act.operation.outputFields || [],
                            sample: res.sample || act.operation.sample || {},
                          },
                        };
                      } else {
                        return act;
                      }
                    }),
                  ],
                  triggers: [
                    ...(connector.triggers || []).map((trig) => {
                      if (
                        trig.key === operation?.key &&
                        trig.operation &&
                        type === "trigger"
                      ) {
                        return {
                          ...trig,
                          operation: {
                            ...trig.operation,
                            inputFields:
                              res.inputFields || trig.operation.inputFields,
                            outputFields:
                              res.outputFields && res.outputFields.length > 0
                                ? res.outputFields
                                : trig.operation.outputFields || [],
                            sample: res.sample || trig.operation.sample || {},
                          },
                        };
                      } else {
                        return trig;
                      }
                    }),
                  ],
                });
              }
              setLoading(false);
            })
            .catch((err) => {
              console.error("grinderyNexusConnectorUpdateFields error", err);
              setLoading(false);
            });
        }
      } else {
        setLoading(false);
      }
      setValChanged(false);
    }),
    []
  );

  const renderField = (field: Field, idx?: number) => {
    const v =
      typeof idx !== "undefined" && Array.isArray(workflowValue)
        ? workflowValue[idx]
        : workflowValue;
    const commonProps = {
      placeholder: field.placeholder || "",
      onChange: (v: string) => {
        handleFieldChange(v, idx);
      },
      label: field.label || field.key || "",
      required: !!field.required,
      tooltip: field.helpText || "",
      error: !field.list ? error : !v ? error : false,
      value: v,
    };

    if (field.readonly) {
      return (
        <ReadOnlyWrapper>
          <RichInput
            {...commonProps}
            onChange={() => {}}
            readonly
            options={[]}
            copy
          />
        </ReadOnlyWrapper>
      );
    }

    switch (field.type) {
      case "boolean":
        return (
          <Select {...commonProps} type="default" options={booleanOptions} />
        );
      default:
        return field.choices ? (
          <Autocomplete {...commonProps} size="full" options={fieldOptions} />
        ) : field.key === "_grinderyChain" ? (
          <Autocomplete
            {...commonProps}
            size="full"
            options={[...evmChains, BLOCKCHAINS]}
          />
        ) : (
          <RichInput
            {...commonProps}
            options={options || []}
            user={user}
            hasAddressBook={field.type === "address"}
            addressBook={addressBook}
            setAddressBook={setAddressBook}
          />
        );
    }
  };

  useEffect(() => {
    if (valChanged) {
      if (
        (typeof inputField.updateFieldDefinition === "undefined" ||
          inputField.updateFieldDefinition) &&
        operation?.operation?.inputFieldProviderUrl
      ) {
        setLoading(true);
        updateFieldsDefinition();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    valChanged,
    updateFieldsDefinition,
    setLoading,
    inputField.updateFieldDefinition,
  ]);

  useEffect(() => {
    if (inputField && inputField.default && !workflowInputValue) {
      handleFieldChange(inputField.default);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <React.Fragment key={inputField.key}>
      {inputField && (
        <>
          {inputField.type === "info" &&
          (inputField.label || inputField.helpText) ? (
            <AlertWrapper>
              <Alert
                color="warning"
                elevation={0}
                icon={<img src={ICONS.WARNING} width={20} height={20} alt="" />}
              >
                <div style={{ textAlign: "left" }}>
                  {inputField.label && (
                    <WarningTitle>{inputField.label}</WarningTitle>
                  )}
                  {inputField.helpText && (
                    <WarningText>{inputField.helpText}</WarningText>
                  )}
                </div>
              </Alert>
            </AlertWrapper>
          ) : (
            <>
              <InputWrapper>
                {renderField(inputField, inputField.list ? 0 : undefined)}
                {inputField.list && (
                  <IconButtonWrapper>
                    <IconButton
                      icon={ICONS.PLUS}
                      onClick={() => {
                        setValuesNum((currentValuesNum) => [
                          ...currentValuesNum,
                          (currentValuesNum[currentValuesNum.length - 1] || 0) +
                            1,
                        ]);
                      }}
                    />
                  </IconButtonWrapper>
                )}
              </InputWrapper>
              {valuesNum.length > 0 &&
                inputField.list &&
                valuesNum.map((idx, i) => (
                  <InputWrapper
                    key={idx.toString()}
                    style={{ marginTop: "0px" }}
                  >
                    {renderField(
                      { ...inputField, key: inputField.key + "_" + (i + 1) },
                      inputField.list ? i + 1 : undefined
                    )}
                    <IconButtonWrapper>
                      <IconButton
                        icon={ICONS.TRASH}
                        onClick={() => {
                          if (Array.isArray(workflowValue)) {
                            const curVal = [...workflowValue];
                            curVal.splice(i + 1, 1);
                            const key =
                              type === "trigger"
                                ? "trigger.input." + inputField.key
                                : "actions[" +
                                  index +
                                  "].input." +
                                  inputField.key;
                            updateWorkflow({
                              [key]: curVal,
                            });
                          }
                          setValChanged(true);
                          setValuesNum((currentValuesNum) => [
                            ...currentValuesNum.filter((i2) => i2 !== idx),
                          ]);
                        }}
                      />
                    </IconButtonWrapper>
                  </InputWrapper>
                ))}
            </>
          )}
        </>
      )}
    </React.Fragment>
  );
};

export default WorkflowInputField;
