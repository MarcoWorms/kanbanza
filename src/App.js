/* eslint no-unused-vars: 0 */
import React, { useState, useEffect, useRef } from 'react'
import { v4 as uuid } from 'uuid'
import preset from '@rebass/preset'
import { ThemeProvider } from 'emotion-theming'
// import { ThemeProvider } from 'rebass/styled-components'
import { Box, Flex, Heading, Text, Button, Link, Image, Card } from 'rebass'
import { Input, Textarea } from '@rebass/forms'
import ReactMarkdown from "react-markdown";
import './reset.css'
import { without } from 'ramda'
// OR use 'rebass/styled-components'

const theme = {
  ...preset,
  buttons: {
    ...preset.buttons,
    primary: {
      ...preset.buttons.primary,
      color: '#666',
      backgroundColor: '#eee',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: '#666',
        color: '#eee'
      },
      '&:disabled' : {
        opacity: 0.2
      },
    },
    secondary: {
      ...preset.buttons.secondary,
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: 'blue',
      },
    },
    warning: {
      color: 'black',
      backgroundColor: 'rgb(255, 200, 200)',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: 'red',
        color: 'black',
      },
    },
    outline: {
      ...preset.buttons.outline,
      color: '#666',
      backgroundColor: '#eee',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: '#666',
        color: '#eee'
      }
    }
  }
}

const EditableText = props => {

  const [editingText, setEditingText] = useState(false)
  const [value, setValue] = useState('')

  // const enterPressed = useKeyPress("Enter")

  // useEffect(() => {
  //   if (editingText && enterPressed) {
  //     setEditingText(false)
  //     props.onEdit && props.onEdit(value)
  //   }
  // }, [enterPressed])

  if (editingText) {
    return <Textarea m={3} width='92%' height={props.height} maxWidth={props.maxWidth} autoFocus onChange={e => setValue(e.target.value)} value={value}
    onFocus={(e) => {
      e.target.selectionStart = e.target.value.length;
      e.target.selectionEnd = e.target.value.length;
    }}
    onBlur={() => {
      setEditingText(false)
      props.onEdit && props.onEdit(value)
    }} />
  }

  return <Box 
    onClick={() => {
    setValue(props.children.props.children)
    setEditingText(true)
  }}>{props.children}</Box>
}

const Task = (props) => (
  <Box minWidth={500} maxWidth={500} m={2} p={2} backgroundColor='#fbfbfb' sx={{ borderRadius: 4 }}>

    <Box m={3} mb={5} overflow='hidden'>
      <EditableText height={300} onEdit={v => editTask(props.flow, props.task, { description: v }, props.setFlow)}>
        <ReactMarkdown children={props.description} />
      </EditableText>
    </Box>

    <Flex justifyContent='space-between' alignItems='flex-start'>
      {/* <EditableText onEdit={v => editTask(props.flow, props.task, { title: v }, props.setFlow)} maxWidth={260}><Heading as='h3' m={2} fontSize={3} className={'wrapHard'} maxWidth={270}>
        {props.title}
      </Heading></EditableText>  */}
        <Button variant='primary' onClick={() => regressTask(props.flow, props.task, props.setFlow)} disabled={props.stepIndex === 0}>
          {'<'}
        </Button>
        <Button variant='warning' ml={2} onClick={() => {
          if (window.confirm('Are you sure?')) {
            deleteTask(props.flow, props.task, props.setFlow)
          }
        }}>{'Delete'}</Button>
        <Button variant='primary' ml={2} onClick={() => progressTask(props.flow, props.task, props.setFlow)} disabled={props.stepIndex === props.flow.steps.length - 1}> 
          {'>'}
        </Button>
    </Flex>
  </Box>
)

const Step = (props) => (
  <Flex flexDirection={'column'} minWidth={520} m={2} className={'wrapHard'}>
    <EditableText onEdit={v => editStep(props.flow, props.step, { title: v }, props.setFlow)}><Heading as='h2' m={1} mt={3} mb={props.editing ? 2 : 4} textAlign='center' fontSize={5}>
      {props.title}
    </Heading></EditableText>
    {props.editing && <Flex justifyContent='center'> 
        <Button variant='primary' ml={4} onClick={() => regressStep(props.flow, props.stepIndex, props.setFlow)} disabled={props.stepIndex === 0}>{'<'}</Button>
        <Button variant='primary' ml={2} onClick={() => progressStep(props.flow, props.stepIndex, props.setFlow)} disabled={props.stepIndex === props.flow.steps.length - 1}>{'>'}</Button>
        <Button variant='warning' ml={2} onClick={() => {
          if (window.confirm('Are you sure?')) {
            deleteStep(props.flow, props.step, props.setFlow)
          }
        }}>
          Delete
        </Button>
      </Flex>}
    <Flex alignItems='center' flexDirection='column'>
      {props.children}
    </Flex>
  </Flex>
)

const Flow = (props) => (
  <Flex flexDirection='column' m={2}>
    <Flex justifyContent='center'>
      <EditableText onEdit={v => editFlow(props.flow, { title: v }, props.setFlow)}><Heading as='h1' mb={4} mt={3} fontSize={6}>
        {props.flow.title}
      </Heading></EditableText>
    </Flex>
    <Flex justifyContent='center' mb={3}>
      <Button variant='secondary' onClick={() => props.flow.steps.length > 0 && createTask(props.flow, props.setFlow)}>
        Create Task
      </Button>
      <Button variant='secondary' ml={2} onClick={() => createStep(props.flow, props.setFlow)}>
        Create Step
      </Button>
      <Button variant='secondary' ml={2} onClick={() => props.setEditing(!props.editing)}>
        Edit Flow
      </Button>
      <Button variant='outline' ml={2}>
        View Metrics (to be done)
      </Button>
    </Flex>
    <Flex> 
      {props.flow.steps.map((step, stepIndex) => (
        <Step editing={props.editing} {...step} flow={props.flow} setFlow={props.setFlow} key={step.id} step={step} stepIndex={stepIndex} >
          {props.flow.tasks
            .filter(task => task.step === step.id)
            .slice().sort((a, b) => b.updatedAt - a.updatedAt)
            .map(task => (
              <Task editing={props.editing} {...task} flow={props.flow} setFlow={props.setFlow} stepIndex={stepIndex} key={task.id} task={task} />
            ))}
        </Step>
      ))}
    </Flex>
  </Flex>
)

const FlowContainer = (props) => {

  const [editing, setEditing] = useState(false)
  const [flow, setFlow] = useStickyState({
    title: 'Main Flow',
    steps: [
      { id: uuid(), createdAt: Date.now(), updatedAt: Date.now(), title: 'Todo' },
      { id: uuid(), createdAt: Date.now(), updatedAt: Date.now(), title: 'Doing' },
      { id: uuid(), createdAt: Date.now(), updatedAt: Date.now(), title: 'Done' },
    ],
    tasks: [],
  })

  return(
    <ThemeProvider theme={theme}>
      <Box variant='styles.root' overflowX='auto'>
        <Flow editing={editing} setEditing={setEditing} flow={flow} setFlow={setFlow} />
      </Box>
    </ThemeProvider>
  )
}

export default FlowContainer

const progressTask = (flow, task, setFlow) => {
  flow.steps.forEach((step, i) => {
    if (step.id === task.step) {
      setFlow({ ...flow, tasks: flow.tasks.map(t => t.id === task.id ? {...task, step: flow.steps[i + 1].id, updatedAt: Date.now() } : t) })
    }
  })
}

const regressTask = (flow, task, setFlow) => {
  flow.steps.forEach((step, i) => {
    if (step.id === task.step) {
      setFlow({ ...flow, tasks: flow.tasks.map(t => t.id === task.id ? {...task, step: flow.steps[i - 1].id, updatedAt: Date.now() } : t) })
    }
  })
}

const createTask = (flow, setFlow) => {
  setFlow({
    ...flow,
    tasks: flow.tasks.concat({
      id: uuid(),
      // title: 'A new task!',
      description: `# a new task!
      
with a [markdown](https://guides.github.com/features/mastering-markdown/) **powered** *description*

![img](https://i.pinimg.com/474x/37/1c/d0/371cd0fe379985358692fcf940da0dac.jpg)`,
      step: flow.steps[0].id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    }),
  })
}

const deleteTask = (flow, task, setFlow) => {
  setFlow({
    ...flow,
    tasks: flow.tasks.map(t => t.id === task.id ? undefined : t).filter(v => v)
  })
}

const editTask = (flow, task, newTask, setFlow) => {
  setFlow({
    ...flow,
    tasks: flow.tasks.map(t =>
      t.id === task.id
      ? {...task, ...newTask, updatedAt: Date.now() }
      : t
    ),
  })
}

const progressStep = (flow, stepIndex, setFlow) => {
  let tmp = null
  flow.steps.forEach((step, i) => {
    if (i === stepIndex) {
      tmp = flow.steps[i + 1]
      setFlow({ ...flow, steps: flow.steps.map((el, ii) => ii === i ? tmp : el).map((el, ii) => ii === i + 1 ? step : el) })
    }
  })
}

const regressStep = (flow, stepIndex, setFlow) => {
  let tmp = null
  flow.steps.forEach((step, i) => {
    if (i === stepIndex) {
      tmp = flow.steps[i - 1]
      setFlow({ ...flow, steps: flow.steps.map((el, ii) => ii === i ? tmp : el).map((el, ii) => ii === i - 1 ? step : el) })
    }
  })
}

const createStep= (flow, setFlow) => {
  setFlow({
    ...flow,
    steps: flow.steps.concat({
      id: uuid(),
      title: 'New Step',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    }),
  })
}

const deleteStep= (flow, step, setFlow) => {
  setFlow({
    ...flow,
    steps: flow.steps.map(t => t.id === step.id ? undefined : t).filter(v => v),
    tasks: flow.tasks.map(t => t.step === step.id ? undefined : t).filter(v => v)
  })
}

const editStep = (flow, step, newStep, setFlow) => {
  setFlow({
    ...flow,
    steps: flow.steps.map(t =>
      t.id === step.id
      ? {...step, ...newStep, updatedAt: Date.now(), }
      : t
    ),
  })
}

const editFlow = (flow, newFlow, setFlow) => {
  setFlow({
    ...flow,
    ...newFlow,
  })
}

function useKeyPress(targetKey) {
  // State for keeping track of whether key is pressed
  const [keyPressed, setKeyPressed] = useState(false)
  // If pressed key is our target key then set to true
  function downHandler({ key }) {
    if (key === targetKey) {
      setKeyPressed(true)
    }
  }
  // If released key is our target key then set to false
  const upHandler = ({ key }) => {
    if (key === targetKey) {
      setKeyPressed(false)
    }
  }
  // Add event listeners
  useEffect(() => {
    window.addEventListener("keydown", downHandler)
    window.addEventListener("keyup", upHandler)
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener("keydown", downHandler)
      window.removeEventListener("keyup", upHandler)
    }
  }, []) // Empty array ensures that effect is only run on mount and unmount
  return keyPressed
}

function useStickyState(defaultValue, key) {
  const [value, setValue] = React.useState(() => {
    const stickyValue = window.localStorage.getItem(key);
    return stickyValue !== null
      ? JSON.parse(stickyValue)
      : defaultValue;
  });
  React.useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}