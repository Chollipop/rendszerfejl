<?php
class DatabaseConnection
{
    private  $host = "localhost";
    private  $user = "root";
    private  $passwd = "";
    private  $db_name = "autorent";
    private $db;

    public function __construct()
    {
        $this->db = new mysqli($this->host, $this->user, $this->passwd, $this->db_name);
    }


    protected function DataFetch($command)
    {
        $result = $this->db->query($command);
        if ($this->db->errno == 0)
        {
            if ($result->num_rows != 0)
            {
                $data = $result->fetch_all(MYSQLI_ASSOC);
            }
            else
            {
                $data = array('response' => "No data");
            }
        }
        else
        {
            $data = array('response' => $this->db->error);
        }
        return json_encode($data, JSON_UNESCAPED_UNICODE);
    }
}
