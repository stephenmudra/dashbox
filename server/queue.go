package server

import (
	"github.com/joyrexus/buckets"
	"gopkg.in/mgo.v2/bson"
	"encoding/json"
	"github.com/deckarep/golang-set"
	"log"
	"time"
	"sort"
)

type QueueItem struct {
	Uri		string 			`json:"link"`
	LastVote	time.Time		`json:"lastVote"`
	Votes		[]interface{} 	`json:"votes"`
}

func (r QueueItem) Marshal() ([]byte, error) {
	return bson.Marshal(&r)
}

func (r *QueueItem) Unmarshal(in []byte) (error) {
	return bson.Unmarshal(in, r)
}

func (r QueueItem) String() string {
	out, _ := json.Marshal(&r)
	return string(out)
}

type Queue struct {
	quit  chan bool
	bx *buckets.DB
	db *buckets.Bucket
}

func NewQueue() (*Queue, error) {
	bx, err := buckets.Open("Dashbox.db")
	if (err != nil) {
		return nil, err
	}

	db, err := bx.New([]byte("Queue"))
	if (err != nil) {
		return nil, err
	}

	q := &Queue{make(chan bool, 1), bx, db}

	return q, nil
}

func (q *Queue) Close() error {
	select {
	case q.quit <- true:
	default:
	}

	q.bx.Close()

	return nil
}

func (q *Queue) VoteTrack(link string, userId string) error {
	item := QueueItem{
		Uri: link,
		LastVote: time.Now(),
		Votes: []interface{}{},
	}

	value, err := q.db.Get([]byte(link))
	if err == nil && value != nil {
		err = item.Unmarshal(value)
		if err != nil {
			return err
		}
	}

	votes := mapset.NewSetFromSlice(item.Votes)
	if (!votes.Contains(userId)) {
		item.LastVote = time.Now()
		item.Votes = append(item.Votes, userId)
	}

	log.Println("[queue.go] ", item.String())

	value, err = item.Marshal()
	if err != nil {
		return err
	}

	return q.db.Put([]byte(item.Uri), value)
}

func (q *Queue) GetTrack(link string) QueueItem {
	item := QueueItem{}
	value, err := q.db.Get([]byte(link))
	if err == nil && value != nil {
		err = item.Unmarshal(value)
	}

	return item
}



func (q *Queue) ResetVotes(link string) error {
	item := QueueItem{
		Uri: link,
		LastVote: time.Now(),
		Votes: []interface{}{},
	}

	value, err := q.db.Get([]byte(link))
	if err != nil {
		return err
	}

	err = item.Unmarshal(value)
	if err != nil {
		return err
	}

	item.Votes =[]interface{}{}
	item.LastVote = time.Now()

	log.Println("[queue.go] ", item.String())

	value, err = item.Marshal()
	if err != nil {
		return err
	}

	return q.db.Put([]byte(item.Uri), value)
}

type SortQueue []QueueItem

func (a SortQueue) Len() int {
	return len(a)
}

func (a SortQueue) Swap(i, j int) {
	a[i], a[j] = a[j], a[i]
}

func (a SortQueue) Less(i, j int) bool {
	iVotes := len(a[i].Votes)
	jVotes := len(a[j].Votes)

	if (iVotes != jVotes) {
		return iVotes > jVotes;
	} else {
		return a[j].LastVote.After(a[i].LastVote)
	}
}

func (q *Queue) GetQueue() []QueueItem {
	var list []QueueItem

	items, _ := q.db.Items()
	for _, element := range items {
		route := QueueItem{}
		route.Unmarshal(element.Value)

		list = append(list, route);
	}

	sort.Sort(SortQueue(list))

	return list
}

func (q *Queue) GetNextTrack() *QueueItem {
	list := q.GetQueue()

	if len(list) > 0 {
		return &list[0]
	}

	return nil
}

/*
	items, _ := db.Items()
	for _, element := range items {
		routes = append(routes, route);
	}
*/