import React, { useState, createContext, useEffect, useCallback } from "react";
import _ from "lodash";
import { useGrinderyNexus } from "use-grindery-nexus";
import NexusClient, {
  WorkflowExecution,
  WorkflowExecutionLog,
} from "grindery-nexus-client";
import { Workflow } from "../types/Workflow";
import { isLocalOrStaging, RIGHTBAR_TABS, SCREEN } from "../constants";
import { Connector } from "../types/Connector";
import { defaultFunc } from "../helpers/utils";
import { useNavigate } from "react-router-dom";
import useWindowSize from "../hooks/useWindowSize";
import { validator } from "../helpers/validator";
import { Operation } from "../types/Workflow";
import useWorkspaceContext from "../hooks/useWorkspaceContext";
import { Chain } from "../types/Chain";

type ContextProps = {
  user: any;
  changeTab: (a: string, b?: string) => void;
  disconnect: any;
  appOpened: boolean;
  setAppOpened: (a: boolean) => void;
  workflows: Workflow[];
  setWorkflows: (a: Workflow[]) => void;
  connectors: Connector[];
  getWorkflowsList: () => void;
  getWorkflowHistory: (
    a: string,
    b: (c: WorkflowExecutionLog[]) => void,
    c?: number
  ) => void;
  getWorkflowExecution: (
    a: string,
    b: (c: WorkflowExecutionLog[]) => void
  ) => void;
  editWorkflow: (
    workflow: Workflow,
    redirect?: boolean,
    callback?: () => void
  ) => void;
  accessAllowed: boolean;
  validator: any;
  verifying: boolean;
  workflowExecutions: WorkflowExecutionLog[][];
  setWorkflowExecutions: React.Dispatch<
    React.SetStateAction<WorkflowExecutionLog[][]>
  >;
  apps: any[];
  handleDevModeChange: (a: boolean) => void;
  devMode: boolean;
  deleteWorkflow: (userAccountId: string, key: string) => void;
  client: NexusClient | null;
  access_token: string | undefined;
  moveWorkflowToWorkspace: (
    workflowKey: string,
    workspaceKey: string,
    client: NexusClient | null
  ) => void;
  getConnector: (key: string) => void;
  evmChains: Chain[];
  isOptedIn: boolean;
  chekingOptIn: boolean;
  setIsOptedIn: (a: boolean) => void;
};

type AppContextProps = {
  children: React.ReactNode;
};

export const AppContext = createContext<ContextProps>({
  user: "",
  changeTab: defaultFunc,
  disconnect: defaultFunc,
  appOpened: true,
  setAppOpened: defaultFunc,
  workflows: [],
  setWorkflows: defaultFunc,
  connectors: [],
  getWorkflowsList: defaultFunc,
  getWorkflowHistory: defaultFunc,
  getWorkflowExecution: defaultFunc,
  editWorkflow: defaultFunc,
  accessAllowed: false,
  validator: validator,
  verifying: true,
  workflowExecutions: [],
  setWorkflowExecutions: defaultFunc,
  apps: [],
  handleDevModeChange: defaultFunc,
  devMode: false,
  deleteWorkflow: defaultFunc,
  client: null,
  access_token: undefined,
  moveWorkflowToWorkspace: defaultFunc,
  getConnector: defaultFunc,
  evmChains: [],
  isOptedIn: false,
  chekingOptIn: true,
  setIsOptedIn: () => {},
});

export const AppContextProvider = ({ children }: AppContextProps) => {
  let navigate = useNavigate();
  const { width } = useWindowSize();

  // current workspace
  const { workspace, workspaceToken } = useWorkspaceContext();

  // Dev mode state
  const cachedDevMode = localStorage.getItem("gr_dev_mode");
  const [devMode, setDevMode] = useState(cachedDevMode === "true");

  const [evmChains, setEvmChains] = useState<Chain[]>([]);

  // Auth hook
  const { user, disconnect, token } = useGrinderyNexus();

  const access_token = token?.access_token;

  // app panel opened
  const [appOpened, setAppOpened] = useState<boolean>(
    width >= parseInt(SCREEN.TABLET.replace("px", "")) &&
      width < parseInt(SCREEN.DESKTOP.replace("px", ""))
      ? false
      : true
  );

  // User id
  //const [user, setUser] = useState<any>(null);
  const [accessAllowed, setAccessAllowed] = useState<boolean>(false);

  const [isOptedIn, setIsOptedIn] = useState<boolean>(false);

  const [chekingOptIn, setChekingOptIn] = useState<boolean>(true);

  // user's workflows list
  const [workflows, setWorkflows] = useState<Workflow[]>([]);

  // connectors list
  const [connectors, setConnectors] = useState<Connector[]>([]);

  // verification state
  const [verifying, setVerifying] = useState<boolean>(true);

  // workflows executions
  const [workflowExecutions, setWorkflowExecutions] = useState<
    WorkflowExecutionLog[][]
  >([]);

  // list of apps used in workflows
  const [apps, setApps] = useState<any[]>([]);

  // Nexus API client
  const [client, setClient] = useState<NexusClient | null>(null);
    console.log(`client`,client)
  // change current active tab
  const changeTab = (name: string, query = "") => {
    const tab = RIGHTBAR_TABS.find((tab) => tab.name === name);
    navigate(((tab && tab.path) || "/") + (query ? "?" + query : ""));
  };

  const getWorkflowsList = async () => {
    const res = await client
      ?.listWorkflows(
        workspace && workspace !== "personal" ? workspace : undefined
      )
      .catch((err) => {
        console.error("listWorkflows error:", err.message);
      });

    if (res) {
      setWorkflows(
        _.reverse(
          res
            .map((result: any) => ({
              ...result.workflow,
              key: result.key,
            }))
            .filter((workflow: Workflow) => workflow)
        )
      );
    } else {
      setWorkflows([]);
    }
  };

  const clearWorkflows = () => {
    setWorkflows([]);
  };

  // here is get all the action list to revise can remove this 
  const getConnectors = async () => {
    let stagedCdss = [];
    console.log(`client`,client)
    console.log(`client`,client?.listDrivers())
    const cdss = await client?.listDrivers();
    console.log(`client`,cdss)
    if (isLocalOrStaging) {
      stagedCdss = await client?.listDrivers("staging");
    }

    setConnectors(
      _.orderBy(
        stagedCdss.length > 0 ? stagedCdss : cdss,

        [(cds) => cds.name.toLowerCase()],
        ["asc"]
      )
    );
  };

  const getConnector = async (key: string) => {
    const connector = await client?.getDriver(
      key,
      isLocalOrStaging ? "staging" : undefined
    );
    if (connector) {
      setConnectors(
        _.orderBy(
          [...connectors.map((c) => (c.key === key ? connector : c))],
          [(cds) => cds.name.toLowerCase()],
          ["asc"]
        )
      );
    }
  };

  const getWorkflowExecution = useCallback(
    async (
      executionId: string,
      callback: (newItems: WorkflowExecutionLog[]) => void
    ) => {
      const res = await client
        ?.getWorkflowExecutionLog(executionId)
        .catch((err) => {
          console.error("getWorkflowExecutionLog error:", err.message);
        });

      if (res) {
        callback(res);
      }
    },
    [client]
  );

  const getWorkflowHistory = useCallback(
    async (
      workflowKey: string,
      callback: (newItems: WorkflowExecutionLog[]) => void,
      limit?: number
    ) => {
      //const res = await getWorkflowExecutions(workflowKey);
      const executions = await client
        ?.getWorkflowExecutions(workflowKey, undefined, undefined, limit)
        .catch((err) => {
          console.error("getWorkflowExecutions error:", err.message);
        });

      if (executions) {
        executions.forEach((execution: WorkflowExecution) => {
          getWorkflowExecution(execution.executionId, callback);
        });
      }
    },
    [getWorkflowExecution, client]
  );

  const editWorkflow = async (
    workflow: Workflow,
    redirect?: boolean,
    callback?: () => void
  ) => {
    const res = await client
      ?.updateWorkflow(workflow.key, workflow)
      .catch((err) => {
        console.error("updateWorkflow error:", err.message);
      });

    if (res) {
      await getWorkflowsList();
    }
    if (redirect) {
      navigate("/workflows");
    } else {
      if (callback) {
        callback();
      }
    }
  };

  const verifyUser = async () => {
    setAccessAllowed(true);
    setIsOptedIn(true);

    // origin code
    // setVerifying(true);
    // const res = await client?.isUserHasEmail().catch((err) => {
    //   console.error("isUserHasEmail error:", err.message);
    //   setAccessAllowed(false);
    // });
    // if (res) {
    //   setAccessAllowed(true);
    //   const optinRes = await client?.isAllowedUser().catch((err) => {
    //     console.error("isAllowedUser error:", err.message);
    //     setIsOptedIn(false);
    //   });
    //   if (optinRes) {
    //     setIsOptedIn(true);
    //   } else {
    //     setIsOptedIn(false);
    //   }
    // } else {
    //   setAccessAllowed(false);
    // }
    // setChekingOptIn(false);
    // setVerifying(false);
  };

  const addExecutions = useCallback((newItems: WorkflowExecutionLog[]) => {
    setWorkflowExecutions((items) => [...items, newItems]);
  }, []);

  const getApps = (workflowsList: Workflow[], connectorsList: Connector[]) => {
    if (workflowsList && workflowsList.length > 0) {
      const usedConnectorsKeys = _.uniq(
        _.flatten(
          workflowsList.map((workflow: Workflow) => [
            workflow.trigger.connector,
            ...workflow.actions.map((action: Operation) => action.connector),
          ])
        )
      );
      const usedApps = _.orderBy(
        usedConnectorsKeys.map((connectorKey: string) => {
          const connectorObject = connectorsList.find(
            (connector: Connector) => connector.key === connectorKey
          );
          return {
            ...connectorObject,
            workflows: workflowsList.filter(
              (workflow: Workflow) =>
                workflow.trigger.connector === connectorKey ||
                workflow.actions.filter(
                  (action: Operation) => action.connector === connectorKey
                ).length > 0
            ).length,
          };
        }),
        ["workflows", "name"],
        ["desc"]
      );
      setApps(usedApps);
    } else {
      setApps([]);
    }
  };

  const handleDevModeChange = (e: boolean) => {
    localStorage.setItem("gr_dev_mode", e.toString());
    setDevMode(e);
  };

  const deleteWorkflow = async (userAccountId: string, key: string) => {
    const res = await client?.deleteWorkflow(key).catch((err) => {
      console.error("deleteWorkflow error:", err.message);
    });
    if (res) {
      getWorkflowsList();
    }
  };

  const initClient = (accessToken: string) => {
    const nexus = new NexusClient();
    nexus.authenticate(accessToken);
    setClient(nexus);
  };

  const moveWorkflowToWorkspace = async (
    workflowKey: string,
    workspaceKey: string,
    client: NexusClient | null
  ) => {
    const res = await client?.moveWorkflowToWorkspace(
      workflowKey,
      workspaceKey
    );
    if (res) {
      getWorkflowsList();
    }
  };

  const getChains = async (nexusClient: NexusClient) => {
    let res;
    try {
      res = await nexusClient.listChains(
        "evm",
        isLocalOrStaging ? "staging" : "production"
      );
    } catch (err) {
      console.error("getChains error: ", err);
      setEvmChains([]);
      return;
    }
    setEvmChains(res);
  };

  useEffect(() => {
    if (client) {
      getChains(client);
    }
  }, [client]);

  useEffect(() => {
    setWorkflowExecutions([]);
  }, [workspace]);

  useEffect(() => {
    if (user && accessAllowed && client && workspace) {
      getConnectors();
      getWorkflowsList();
    } else {
      clearWorkflows();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, accessAllowed, client, workspace]);

  useEffect(() => {
    if (user && client) {
      verifyUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, client]);

  // verify user on success authentication
  useEffect(() => {
    if (user && token?.access_token) {
      initClient(token?.access_token);
      //navigate("/workflows");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token?.access_token]);

  useEffect(() => {
    if (
      width >= parseInt(SCREEN.TABLET_XL.replace("px", "")) &&
      width < parseInt(SCREEN.DESKTOP.replace("px", "")) &&
      appOpened
    ) {
      setAppOpened(false);
    }
    if (width < parseInt(SCREEN.TABLET.replace("px", "")) && !appOpened) {
      setAppOpened(true);
    }
  }, [width, appOpened]);

  useEffect(() => {
    getApps(workflows, connectors);
  }, [workflows, connectors]);

  useEffect(() => {
    if (workspaceToken) {
      initClient(workspaceToken);
    } else {
      if (token?.access_token) {
        initClient(token?.access_token);
      }
    }
  }, [workspaceToken, token]);

  return (
    <AppContext.Provider
      value={{
        user,
        changeTab,
        disconnect,
        appOpened,
        setAppOpened,
        workflows,
        setWorkflows,
        connectors,
        getWorkflowsList,
        getWorkflowHistory,
        getWorkflowExecution,
        editWorkflow,
        accessAllowed,
        validator,
        verifying,
        workflowExecutions,
        setWorkflowExecutions,
        apps,
        devMode,
        handleDevModeChange,
        deleteWorkflow,
        client,
        access_token,
        moveWorkflowToWorkspace,
        getConnector,
        evmChains,
        isOptedIn,
        chekingOptIn,
        setIsOptedIn,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
