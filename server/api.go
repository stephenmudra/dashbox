package server

import (
	"net/http"
	//"github.com/gorilla/mux"
	"log"
	"encoding/json"
	"net"
	"errors"
)

type (
	Vote struct {
		Track   string `json:"track"`
	}
)

type Api struct {
	queue *Queue
	musicPlayer *MusicPlayer
}

func NewApi(addrs string, queue *Queue, musicPlayer *MusicPlayer) (*Api, error) {
	a := &Api{
		queue,
		musicPlayer,
	}

	http.HandleFunc("/api/vote", a.votePost)
	http.HandleFunc("/api/queue", a.queueGet)
	http.Handle("/", http.FileServer(http.Dir("./public/")))

	go http.ListenAndServe(addrs, nil)
	log.Println("[api.go] Serving on Address ", addrs)

	return a, nil
}


func (a *Api) votePost(w http.ResponseWriter, r *http.Request) {
	var vote *Vote
	err := json.NewDecoder(r.Body).Decode(&vote)
	if err != nil {
		http.Error(w, "", 503)
		return
	}
	defer r.Body.Close()

	log.Println("[api.go] api/vote track=", vote.Track, " ip=", findIpAddress(r))

	track, err := a.musicPlayer.LoadTrackByURI(vote.Track)
	if err != nil {
		http.Error(w, "", 503)
		return
	}

	a.queue.VoteTrack(track.Uri, findIpAddress(r))

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(201)

	out, _ := json.Marshal(a.queue.GetTrack(track.Uri))
	w.Write(out)
}


type (
	Entities struct {
		Queue   []QueueItem	`json:"queue"`
		Playing string `json:"playing"`
		User	string `json:"user"`
	}
)

func (a *Api) queueGet(w http.ResponseWriter, r *http.Request) {
	out, _ := json.Marshal(&Entities{
		Queue: a.queue.GetQueue(),
		User: findIpAddress(r),
		Playing: a.musicPlayer.CurrentTrack.Uri,
	})

	log.Println("[api.go] Load Queue")

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(201)
	w.Write(out)
}

func (a *Api) SetNextTrack() error {
	item := a.queue.GetNextTrack()
	if item == nil {
		log.Println("[api.go] Error loading next track")
		return errors.New("Could not load next track")
	}

	return a.musicPlayer.SetNextTrack(item.Uri)
}

func findIpAddress(r *http.Request) string {
	ip, _, _ := net.SplitHostPort(r.RemoteAddr)
	return ip

	//return r.Header.Get("X-FORWARDED-FOR")
}
