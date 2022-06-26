import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from "socket.io-client";
import { v4 as uuidv4 } from 'uuid';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import TextField from '@mui/material/TextField';
import { makeStyles } from '@material-ui/core/';
import Box from '@mui/material/Box';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    maxWidth: '100%',
  },
  link: {
    width: '50%',
  },
  worker: {

  },
  typography: {
    wordWrap: "break-word",
  }
}));

const socket = io.connect("https://duthris-web-crawler.herokuapp.com");

function App() {
  const classes = useStyles();
  const linksEndRef = useRef(null);
  const endOfDiv = () => {
    linksEndRef.current.scrollIntoView({ behavior: "smooth" })
  }

  const [link, setLink] = useState('');
  const [workerAmount, setWorkerAmount] = useState('');
  const [links, setLinks] = useState([]);

  const isValidLink = (url) => {
    var pattern = /(http|https):\/\/(www)?(\.+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!-]))?/;
    return pattern.test(url);
}

  const sendData = () => {
    socket.emit('sendData', { link: `${link}`, nWorker: workerAmount, room: `${uuidv4()}` })
    axios.get(`/crawler`)
    setLink('');
    setWorkerAmount('');
  }
  const handleLink = (e) => { setLink(e.target.value) }
  const handleWorkerAmount = (e) => { setWorkerAmount(e.target.value) }

  useEffect(() => {
    socket.on('newLink', (data) => {
      console.log(data)
      setLinks(links => [...links, data]);
      endOfDiv();
    });

    return () => {
      socket.off("newLink")
    }
  }, []);

  useEffect(() => {
    socket.on('test', (data) => {
      console.log(data)
    })

    return () => { socket.off("test") };
  }, []);

  return (
    <>
      <div className={classes.root}>
        <TextField
          className={classes.link}
          label='Link to Crawl'
          value={link}
          onChange={handleLink}
          color="secondary"
          variant="filled"
          size="small"
          required
          style={{ marginBottom: '10px' }}
          error={!link || !isValidLink(link)}
          helperText={!link || !isValidLink(link) ? '❌ Invalid Link' : ''}
        />

        <TextField
          className={classes.worker}
          label='Worker Amount'
          value={workerAmount}
          onChange={handleWorkerAmount}
          color="secondary"
          variant="filled"
          size="small"
          required
          type='number'
          InputProps={{ inputProps: { min: 1 } }}
          style={{ marginBottom: '10px' }}
          error={!workerAmount || workerAmount < 1}
          helperText={!workerAmount || workerAmount < 1 ? '❌Invalid Worker Amount' : ''}
        />

        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={sendData}
          color="secondary"
          size="large"
          type="submit"
          disabled={!link || !workerAmount}
          style={{ padding: '10px', marginBottom: '10px' }}
        >
          Crawl Urls
        </Button>
      </div>

      {links.map((link, index) => <Box sx={{
        boxShadow: 4,
        p: 1,
        m: 1,
        borderRadius: 2,
        textAlign: 'center',
        fontSize: '0.875rem',
        fontWeight: '700',
        borderBottom: '10px',
        color: '#7b1fa2'
      }} 
      className={classes.typography} 
      key={index}
      >{link}</Box>
      )}

      <div ref={linksEndRef}></div>
    </>
  )
}

export default App