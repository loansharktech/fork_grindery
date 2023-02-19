import React, { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import { Snackbar } from "grindery-ui";
import styled from "styled-components";
import useAppContext from "../../hooks/useAppContext";
import useWorkflowContext from "../../hooks/useWorkflowContext";

const Container = styled.div`
  margin: 48px auto 0;
  text-align: center;
`;

const Button = styled.button`
  border: none;
  background: #8c30f5;
  padding: 9.5px 16px;
  font-family: "Roboto";
  font-weight: 700;
  font-size: 14px;
  line-height: 150%;
  text-align: center;
  color: #ffffff;
  border-radius: 5px;
  cursor: pointer;
  box-shadow: none;

  &:hover {
    box-shadow: 0px 4px 8px rgba(106, 71, 147, 0.1);
  }

  &:disabled {
    background: #dcdcdc;
    cursor: not-allowed;
    color: #706e6e;
  }

  &:disabled:hover {
    box-shadow: none;
  }
`;

type Props = {};

const WorkflowSave = (props: Props) => {
  const { workflow, saveWorkflow, workflowReadyToSave, updateWorkflow } =
    useWorkflowContext();
  const { editWorkflow } = useAppContext();
  const { key } = useParams();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    opened: false,
    message: "",
    severity: "suscess",
  });

  const handleClick = async () => {
    if (key) {
      setLoading(true);
      const wf = { ...workflow };
      delete wf.signature;
      delete wf.system;

      editWorkflow(
        {
          ...wf,
          state: wf.state === "on" && workflowReadyToSave ? "on" : "off",
          signature: JSON.stringify(wf),
        },
        false,
        () => {
          setSnackbar({
            opened: true,
            message: "Workflow updated",
            severity: "success",
          });
          setLoading(false);
        }
      );
      updateWorkflow({
        state: wf.state === "on" && workflowReadyToSave ? "on" : "off",
      });
    } else {
      saveWorkflow();
    }
  };

  return (
    <Container>
      <Button disabled={loading} onClick={handleClick}>
        Save workflow
      </Button>
      <Snackbar
        open={snackbar.opened}
        handleClose={() => {
          setSnackbar({
            opened: false,
            message: "",
            severity: snackbar.severity,
          });
        }}
        message={snackbar.message}
        hideCloseButton
        autoHideDuration={2000}
        severity={snackbar.severity}
      />
    </Container>
  );
};

export default WorkflowSave;
