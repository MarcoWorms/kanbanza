/* eslint no-unused-vars: 0 */
import React, { useState, useEffect, useRef } from 'react'
import preset from '@rebass/preset'
import { ThemeProvider } from 'emotion-theming'
// import { ThemeProvider } from 'rebass/styled-components'
import { Box, Flex, Heading, Text, Button, Link, Image, Card } from 'rebass'
import { Input, Textarea } from '@rebass/forms'
import './reset.css'
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
      }
    },
    secondary: {
      ...preset.buttons.secondary,
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: 'blue'
      }
    },
    warning: {
      color: '#222',
      backgroundColor: 'rgb(255, 150, 150)',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: 'red',
        color: 'black'
      }
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

  const enterPressed = useKeyPress("Enter")

  useEffect(() => {
    if (editingText && enterPressed) {
      setEditingText(false)
      props.onEdit && props.onEdit(value)
    }
  }, [enterPressed])

  if (editingText) {
    return <Textarea m={3} width='92%' height={props.height} maxWidth={props.maxWidth} autoFocus onChange={e => setValue(e.target.value)} value={value} onBlur={() => {
      setEditingText(false)
      props.onEdit && props.onEdit(value)
    }} />
  }

  return <Box onClick={() => {
    setValue(props.children.props.children)
    setEditingText(true)
  }}>{props.children}</Box>
}

const Task = (props) => (
  <Card minWidth={400} maxWidth={400} m={2} p={2}>
    <Flex justifyContent='space-between' alignItems='flex-start'>
      {/* <Button variant='primary'>{'Delete'}</Button> */}
      <EditableText maxWidth={260}><Heading as='h3' m={2} fontSize={3} className={'wrapHard'} maxWidth={270}>
        A new task
      </Heading></EditableText> 
      {props.editing
        ? <Button variant='warning' ml={2} onClick={() => {
          if (window.confirm('Are you sure?')) {
            console.log('delete')
          }
        }}>{'Delete'}</Button>
        : <Flex>
        <Button variant='primary'>
          {'<'}
        </Button>
        <Button variant='primary' ml={2}>
          {'>'}
        </Button>
      </Flex>}
    </Flex>
    <EditableText height={200}><Text m={2} className='wrapHard'>
      A new task *markdown powered* description. A new task *markdown powered*
      description. A new task *markdown powered* description. A new task
      *markdown powered* description. A new task *markdown powered* description.
    </Text></EditableText>
    <Flex justifyContent='flex-end'>
      
    </Flex>
  </Card>
)

const Column = (props) => (
  <Flex flexDirection={'column'} minWidth={400} m={2} className={'wrapHard'}>
    <EditableText><Heading as='h2' m={1} mt={3} textAlign='center' fontSize={5}>
      {props.title}
    </Heading></EditableText>
    <Flex justifyContent='center' opacity={props.editing ? 1 : 0}> 
      <Button variant='primary' ml={4}>{'<'}</Button>
      <Button variant='primary' ml={2}>{'>'}</Button>
      <Button variant='warning' ml={2} onClick={() => {
        if (window.confirm('Are you sure?')) {
          console.log('delete')
        }
      }}>
        Delete
      </Button>
    </Flex>
    <Flex alignItems='center' flexDirection='column'>
      {props.children}
    </Flex>
  </Flex>
)

const Flow = (props) => (
  <Flex flexDirection='column' m={2}>
    <Flex justifyContent='center'>
      <EditableText><Heading as='h1' mb={4} mt={3} fontSize={6}>
        {props.title}
      </Heading></EditableText>
    </Flex>
    <Flex justifyContent='center' mb={3}>
      <Button variant='secondary'>
        Create Task
        </Button>
      <Button variant='secondary' ml={2} onClick={() => props.setEditing(!props.editing)}>
        Edit Flow
      </Button>
      <Button variant='outline' ml={2}>
        View Metrics
      </Button>
    </Flex>
    <Flex> 
      <Column editing={props.editing} title='Todo'>
        <Task editing={props.editing} />
        <Task editing={props.editing} />
        <Task editing={props.editing} />
        <Task editing={props.editing} />
      </Column>
      <Column editing={props.editing} title='Doing'>
        <Task editing={props.editing} />
        <Task editing={props.editing} />
      </Column>
      <Column editing={props.editing} title='Done'>
        <Task editing={props.editing} />
      </Column>
    </Flex>
  </Flex>
)

const App = (props) => {

  const [editing, setEditing] = useState(false)

  // const ePressed = useKeyPress("e")
  // const mPressed = useKeyPress("m")
  // const cPressed = useKeyPress("c")

  // useEffect(() => {
  //   if (ePressed) {
  //     setEditing(!editing)
  //   }
  // }, [ePressed])

  return(
    <ThemeProvider theme={theme}>
      <Box variant='styles.root' overflowX='auto'>
        <Flow title={'Main Flow'} editing={editing} setEditing={setEditing} />
      </Box>
    </ThemeProvider>
  )
}

export default App

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