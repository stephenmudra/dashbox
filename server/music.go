package server

import (
	"github.com/op/go-libspotify/spotify"
	"time"
	"fmt"
	"strings"
	"log"
)

type MusicPlayer struct {
	quit  chan bool
	*spotify.Session
	Player *spotify.Player
	NextTrack *musicTrack
	CurrentTrack *musicTrack
	StartOfTrackUpdates chan musicTrack
}

func NewMusicPlayer(config *spotify.Config, username string, password string) (*MusicPlayer, error) {
	session, err := spotify.NewSession(config)
	m := &MusicPlayer{
		make(chan bool, 1),
		session,
		session.Player(),
		nil,
		nil,
		make(chan musicTrack, 1),
	}

	if err != nil {
		return nil, err
	}

	credentials := spotify.Credentials{
		Username: username,
		Password: password,
	}
	if err = session.Login(credentials, false); err != nil {
		return nil, err
	}

	return m, nil
}

func (m *MusicPlayer) Close() error {
	select {
	case m.quit <- true:
	default:
	}

	m.Session.Close()
	m.Player.Unload()

	return nil
}

func (m *MusicPlayer) LoadTrackByURI(uri string) (*musicTrack, error) {
	link, err := m.ParseLink(uri)
	if err != nil {
		return nil, err
	}

	track, err := link.Track()
	if err != nil {
		return nil, err
	}

	track.Wait()
	return &musicTrack{track, link.String(), m}, nil
}

func (m *MusicPlayer) SetNextTrack(uri string) error {
	if m.NextTrack != nil && uri == m.NextTrack.Uri {
		return nil
	}

	track, err := m.LoadTrackByURI(uri)
	if err != nil {
		return err
	}

	log.Println("[music.go] Setting Next Track: ", track.String())

	m.NextTrack = track
	track.Prefetch()

	if (m.CurrentTrack == nil) {
		m.Play()
	}

	return nil
}


func (m *MusicPlayer) Play() error {
	if m.NextTrack == nil {
		return nil
	}

	log.Println("[music.go] Starting Track: ", m.NextTrack.String())

	m.Player.Unload()

	if err := m.Player.Load(m.NextTrack.Track); err != nil {
		return err
	}

	m.CurrentTrack = m.NextTrack
	m.NextTrack = nil

	m.Player.Play()

	select {
	case m.StartOfTrackUpdates <- *m.CurrentTrack:
	default:
	}

	return nil
}


type musicTrack struct {
	*spotify.Track
	Uri string
	*MusicPlayer
}

func (t *musicTrack) Prefetch() error {
	return t.MusicPlayer.Player.Prefetch(t.Track)
}

func formatDuration(d time.Duration) string {
	cen := d / time.Millisecond / 10 % 100
	sec := d / time.Second % 60
	min := d / time.Minute % 60
	return fmt.Sprintf("%02d:%02d.%02d", min, sec, cen)
}

func (t *musicTrack) String() (string) {
	t.Wait()
	var artists []string
	for i := 0; i < t.Artists(); i++ {
		artists = append(artists, t.Artist(i).Name())
	}
	return fmt.Sprintf("%s - %s (%s)",
		strings.Join(artists, ", "),
		t.Name(),
		formatDuration(t.Duration()),
	)
}
