import '@mantine/core/styles.css';
import './App.css'
import { AppShell, Burger, Button, Divider, Drawer, Flex, Group, LoadingOverlay, MantineProvider, NavLink, Stack, TextInput, Textarea } from '@mantine/core';
import { useAssistants } from './hooks/useAssistants';
import { useDisclosure } from '@mantine/hooks';
import Markdown from 'react-markdown';
import { useEffect, useState } from 'react';
import { createThread, createTravelDemo, postMessage } from './api/assistants';

function App() {
  // state
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<Assistant>();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [threadId, setThreadId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // hooks
  const [opened, { toggle }] = useDisclosure();
  let assistants = useAssistants();

  // effects
  useEffect(() => {
    setSelected(assistants[active])
  }, [assistants, active]);

  // handlers
  const handleNavLinkClick = async (index: number) => {
    setActive(index);
    setSelected(assistants[index]);
    await handleNewThread();
  }

  const handleSubmit = () => {
    if (selected) {
      setInputText('');
      setIsLoading(true);
      setMessages([...messages, inputText]);
      postMessage(selected, threadId, inputText)
      .then((message) => setMessages([...messages, message]))
      .finally(() => setIsLoading(false));
    }
  }

  const handleNewThread = async () => {
    const thread = await createThread();
    setThreadId(thread.id);
    setMessages([]);
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  }

  const handleCreateNewAssistant = async () => {
    setIsDrawerOpen(true);
  }

  const handleCreateTravel = async () => {
    await createTravelDemo();
    assistants = await useAssistants();
  }

  return (
    <MantineProvider>
      <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <h3>Assistants Demo</h3>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack justify='space-between' h='100%'>
          <div>
            Assistants
            {assistants
              .map((assistant, index) => (
                <NavLink 
                  key={assistant.id} 
                  h={28} mt="sm" 
                  label={assistant.name} 
                  active={active === index}
                  onClick={() => handleNavLinkClick(index)}
                />
              ))}
          </div>
          <div>
            <Button color='green' onClick={() => handleCreateNewAssistant()}>New Assistant</Button>
            <Button color='green' onClick={() => handleCreateTravel()} style={{ marginTop: '10px' }}>Create Travel Demo</Button>
          </div>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main style={{ display: 'flex', flexDirection: 'column' }}>
          <Drawer opened={isDrawerOpen} onClose={handleCloseDrawer} title="Create a new assistant">
            <Drawer.Body>
              <TextInput label="Assistant name" placeholder='Name'/>
              <Textarea 
                label="Instructions" 
                radius="md" 
                placeholder='You are a helpful assistant who is an expert in... blah blah blah...' 
              />
            </Drawer.Body>
          </Drawer>
          <div className='chat-main' style={{ display: 'flex', flexGrow: 1, height: 'auto' }}>
            <LoadingOverlay visible={isLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
            <Stack
              h={300}
              justify="flex-end"
              className='chat-history'
            >
              {messages.map((msg, index) => {
                return (
                  <div id={index.toString()}>
                    <Markdown>
                      {msg}
                    </Markdown>
                    <Divider my='md'></Divider>
                  </div>
                )
              })}
            </Stack>
          </div>
          <div style={{flexShrink: 1, marginTop: '0.2em' }}>
            <Textarea
              size="xl"
              radius="md"
              label={`Ask ${selected?.name} anything!`}
              className='chat-input'
              value={inputText}
              onChange={(event) => setInputText(event.currentTarget.value)}
            />
            <Group>
              <Button 
                variant="light" 
                color="green" 
                size="md" 
                radius="md"
                onClick={() => handleSubmit()}
              >
                  Submit Message
              </Button>
              <Button 
                variant="light" 
                color="green" 
                size="md" 
                radius="md"
                onClick={() => handleNewThread()}
              >
                  New Thread
              </Button>
            </Group> 
          </div>
    </AppShell.Main>

    </AppShell>
    </MantineProvider>
  );
}

export default App
