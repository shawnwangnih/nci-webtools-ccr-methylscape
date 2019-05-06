const cors = require('cors');
const express = require('express');
const router = express.Router();

router.use(cors());
router.get('/ping', (req, res) => res.json(true));



const data = [];
  for( let i =0; i < 4; i ++){
      data.push(
        {
            key: i,
            experiment: 'Clinical Testing ' + i,
            project: "Methylscape",
            investigator: 'Zeid Abdullaev ' + i,
            date: '12/03/2018'
          }
      )
}

router.get('/test', (req, res) => res.json(data))


module.exports = router;
